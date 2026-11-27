
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import RecipeSearchForm from
  "@/components/recipes/RecipeSearchForm";

import AdvertisementPlaceholder from
  "@/components/shared/AdvertisementPlaceholder";

import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

import {
  findRecipes,
  getCategories,
  getIngredients,
  maxIngredients,
} from "@/lib/recipes/search";

import {
  normalizeIngredient,
} from "@/lib/recipes/searchByIngredient";

const copy = {
  en: {
    title: "Search recipes",
    intro: "Find a recipe by name, ingredients, or category.",
    name: "Recipe name",
    ingredients: "Ingredients",
    picker: "Find an ingredient",
    noIngredients: "No ingredients found.",
    category: "Recipe category",
    all: "All categories",
    submit: "Search",
    clear: "Clear filters",
    defaults: "Recipes to try",
    results: "Search results",
    empty: "No recipes match. Try removing a filter.",
    error: "Recipes are unavailable right now. Please try again.",
    filtersError: "Some filter options could not be loaded.",
    loading: "Loading recipes…",
  },

  es: {
    title: "Buscar recetas",
    intro: "Encuentra recetas por nombre, ingredientes o categoría.",
    name: "Nombre de la receta",
    ingredients: "Ingredientes",
    picker: "Buscar un ingrediente",
    noIngredients: "No se encontraron ingredientes.",
    category: "Categoría",
    all: "Todas las categorías",
    submit: "Buscar",
    clear: "Limpiar filtros",
    defaults: "Recetas para probar",
    results: "Resultados",
    empty: "No hay recetas que coincidan. Prueba quitar un filtro.",
    error: "Las recetas no están disponibles. Inténtalo de nuevo.",
    filtersError: "No se pudieron cargar algunas opciones.",
    loading: "Cargando recetas…",
  },

  "pt-BR": {
    title: "Buscar receitas",
    intro: "Encontre receitas por nome, ingredientes ou categoria.",
    name: "Nome da receita",
    ingredients: "Ingredientes",
    picker: "Buscar um ingrediente",
    noIngredients: "Nenhum ingrediente encontrado.",
    category: "Categoria",
    all: "Todas as categorias",
    submit: "Buscar",
    clear: "Limpar filtros",
    defaults: "Receitas para experimentar",
    results: "Resultados",
    empty: "Nenhuma receita encontrada. Tente remover um filtro.",
    error: "As receitas estão indisponíveis. Tente novamente.",
    filtersError: "Não foi possível carregar algumas opções.",
    loading: "Carregando receitas…",
  },
};

type Props = {
  params: Promise<{ locale: string }>;

  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
};

function first(
  value: string | string[] | undefined
) {
  return (
    (Array.isArray(value) ? value[0] : value)
      ?.trim() ?? ""
  );
}

function mealImage(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "https:" &&
      url.hostname === "www.themealdb.com" &&
      url.pathname.startsWith("/images/media/meals/")
      ? url.href
      : null;
  } catch {
    return null;
  }
}

async function SearchContent({
  searchParams,
  locale,
}: {
  searchParams: Props["searchParams"];
  locale: keyof typeof copy;
}) {
  const text = copy[locale];
  const params = await searchParams;

  const query = first(params.q).slice(0, 100);
  const category = first(params.category).slice(0, 60);

  const inputs = [params.ingredients ?? []]
    .flat()
    .flatMap((value) => value.split(","));

  const unique = new Map<string, string>();

  for (const value of inputs) {
    const name = value.trim().slice(0, 100);

    if (name) {
      unique.set(normalizeIngredient(name), name);
    }

    if (unique.size === maxIngredients) {
      break;
    }
  }

  const [ingredients, categories] =
    await Promise.allSettled([
      getIngredients(),
      getCategories(),
    ]);

  const ingredientOptions =
    ingredients.status === "fulfilled"
      ? ingredients.value
      : [];

  const selected = [...unique].map(
    ([key, name]) =>
      ingredientOptions.find(
        (option) =>
          normalizeIngredient(option) === key
      ) ?? name
  );

  const options = [
    ...new Set([
      ...ingredientOptions,
      ...selected,
    ]),
  ];

  const categoryOptions =
    categories.status === "fulfilled"
      ? categories.value
      : [];

  const path = `/${locale}/search`;

  const filtered = Boolean(
    query || selected.length || category
  );

  const searchKey = JSON.stringify([
    query,
    selected,
    category,
  ]);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">

      {/* Search filters and advertising placement */}
      <div className="min-w-0 space-y-6">
        <RecipeSearchForm
          key={searchKey}
          path={path}
          query={query}
          selected={selected}
          category={category}
          options={options}
          categoryOptions={categoryOptions}
          limit={maxIngredients}
          searchKey={searchKey}
          filtered={filtered}
          filtersFailed={
            ingredients.status === "rejected" ||
            categories.status === "rejected"
          }
          text={text}
        />

        <AdvertisementPlaceholder
          locale={locale}
        />
      </div>

      {/* Recipe search results */}
      <section aria-labelledby="recipe-results">
        <h2
          id="recipe-results"
          className="mb-4 text-2xl font-bold"
        >
          {filtered ? text.results : text.defaults}
        </h2>

        <Suspense
          key={searchKey}
          fallback={
            <p role="status">
              {text.loading}
            </p>
          }
        >
          <RecipeResults
            locale={locale}
            query={query}
            ingredients={selected}
            category={category}
          />
        </Suspense>
      </section>
    </div>
  );
}

async function RecipeResults({
  locale,
  query,
  ingredients,
  category,
}: {
  locale: keyof typeof copy;
  query: string;
  ingredients: string[];
  category: string;
}) {
  const text = copy[locale];

  const results = await findRecipes(
    query,
    ingredients,
    category
  ).catch(() => null);

  if (results === null) {
    return (
      <p role="alert">
        {text.error}
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p role="status">
        {text.empty}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {results.map((recipe) => {
        const image = mealImage(recipe.image);

        return (
          <li key={recipe.id}>
            <Link
              href={`/${locale}/recipes/${encodeURIComponent(recipe.id)}`}
              prefetch={false}
              className="flex items-center gap-4 rounded-[var(--radius-medium)] border border-[var(--border-color)] bg-[var(--surface)] p-3 hover:border-[var(--brand-accent)] sm:gap-5"
            >
              {image ? (
                <Image
                  src={image}
                  alt=""
                  width={112}
                  height={88}
                  className="h-18 w-22 shrink-0 rounded-lg object-cover sm:h-22 sm:w-28"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="h-18 w-22 shrink-0 rounded-lg bg-[var(--surface-muted)] sm:h-22 sm:w-28"
                />
              )}

              <span className="min-w-0 flex-1 break-words text-lg font-semibold">
                {recipe.title}
              </span>

              <span
                aria-hidden="true"
                className="text-[var(--brand-accent)]"
              >
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

async function LocalizedSearch({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const text = copy[locale];

  return (
    <>
      <Header
        locale={locale}
        dictionary={dictionary}
      />

      <main
        id="main-content"
        className="site-container py-10 sm:py-14"
      >
        <div className="mb-8 border-b border-[var(--border-color)] pb-6">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {text.title}
          </h1>

          <p className="mt-2 text-[var(--text-muted)]">
            {text.intro}
          </p>
        </div>

        <Suspense
          fallback={
            <p role="status">
              {text.loading}
            </p>
          }
        >
          <SearchContent
            locale={locale}
            searchParams={searchParams}
          />
        </Suspense>
      </main>

      <Footer
        locale={locale}
        dictionary={dictionary}
      />
    </>
  );
}

export default function SearchPage(props: Props) {
  return (
    <Suspense>
      <LocalizedSearch {...props} />
    </Suspense>
  );
}
