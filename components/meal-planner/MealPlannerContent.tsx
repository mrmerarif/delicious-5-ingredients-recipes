
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  getPlannedMeals,
  removePlannedMeal,
  updatePlannedMeal,
  MEAL_PLANNER_UPDATED,
  type MealType,
  type PlannedMeal,
} from "../../lib/meal-planner/storage";

interface Props {
  locale: string;
}

const translations = {
  en: {
    eyebrow: "YOUR WEEKLY MENU",
    title: "My Meal Planner",
    description:
      "Keep your favorite recipes organized and make every meal easier to plan.",
    total: "Scheduled Meals",
    days: "Planned Days",
    browse: "Explore Recipes",
    emptyTitle: "Your meal planner is ready!",
    empty:
      "Find a recipe you love and add it to your meal planner to get started.",
    date: "Date",
    meal: "Meal",
    remove: "Remove",
    error:
      "This recipe is already scheduled for that date and meal.",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    view: "View Recipe",
    upcoming: "Your Scheduled Recipes",
    essentials: "Kitchen Essentials",
    essentialsDescription:
      "Helpful kitchen tools and ingredients to make cooking easier. Product recommendations are coming soon.",
    comingSoon: "Coming Soon",
  },
  es: {
    eyebrow: "TU MENÚ SEMANAL",
    title: "Mi plan de comidas",
    description:
      "Organiza tus recetas favoritas y facilita la planificación de tus comidas.",
    total: "Comidas programadas",
    days: "Días planificados",
    browse: "Explorar recetas",
    emptyTitle: "¡Tu plan de comidas está listo!",
    empty:
      "Encuentra una receta que te guste y agrégala a tu plan para comenzar.",
    date: "Fecha",
    meal: "Comida",
    remove: "Eliminar",
    error:
      "Esta receta ya está programada para esa fecha y comida.",
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    snack: "Merienda",
    view: "Ver receta",
    upcoming: "Tus recetas programadas",
    essentials: "Esenciales de cocina",
    essentialsDescription:
      "Herramientas e ingredientes útiles para cocinar más fácilmente. Próximamente tendremos recomendaciones de productos.",
    comingSoon: "Próximamente",
  },
  "pt-BR": {
    eyebrow: "SEU CARDÁPIO SEMANAL",
    title: "Meu planejamento de refeições",
    description:
      "Organize suas receitas favoritas e facilite o planejamento das refeições.",
    total: "Refeições planejadas",
    days: "Dias planejados",
    browse: "Explorar receitas",
    emptyTitle: "Seu planejamento está pronto!",
    empty:
      "Encontre uma receita de que você goste e adicione-a ao seu planejamento.",
    date: "Data",
    meal: "Refeição",
    remove: "Remover",
    error:
      "Esta receita já está planejada para essa data e refeição.",
    breakfast: "Café da manhã",
    lunch: "Almoço",
    dinner: "Jantar",
    snack: "Lanche",
    view: "Ver receita",
    upcoming: "Suas receitas planejadas",
    essentials: "Essenciais de cozinha",
    essentialsDescription:
      "Utensílios e ingredientes úteis para facilitar o preparo das refeições. Recomendações de produtos em breve.",
    comingSoon: "Em breve",
  },
} as const;

const mealTypes: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

function formatDate(date: string, locale: string): string {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function MealPlannerContent({
  locale,
}: Props) {
  const language =
    locale === "es" || locale === "pt-BR"
      ? locale
      : "en";

  const t = translations[language];

  const [meals, setMeals] = useState<PlannedMeal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => {
      setMeals(
        getPlannedMeals().sort(
          (a, b) =>
            a.date.localeCompare(b.date) ||
            mealTypes.indexOf(a.mealType) -
              mealTypes.indexOf(b.mealType)
        )
      );

      setLoaded(true);
    };

    refresh();

    window.addEventListener(
      MEAL_PLANNER_UPDATED,
      refresh
    );

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(
        MEAL_PLANNER_UPDATED,
        refresh
      );

      window.removeEventListener("storage", refresh);
    };
  }, []);

  function editMeal(
    id: string,
    changes: Partial<
      Pick<PlannedMeal, "date" | "mealType">
    >
  ) {
    try {
      updatePlannedMeal(id, changes);
      setError("");
    } catch {
      setError(t.error);
    }
  }

  function removeMeal(id: string) {
    removePlannedMeal(id);
    setError("");
  }

  const dates = [
    ...new Set(meals.map((meal) => meal.date)),
  ];

  return (
    <div className="site-container py-10 lg:py-14">
      <section className="mb-10 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-6 sm:p-9">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--fsm-accent)]">
          {t.eyebrow}
        </p>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              {t.title}
            </h1>

            <p className="mt-3 leading-7 text-[var(--text-muted)]">
              {t.description}
            </p>
          </div>

          <Link
            href={`/${language}/recipes`}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-[var(--fsm-accent)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <span aria-hidden="true">⌕</span>
            {t.browse}
          </Link>
        </div>

        {loaded && (
          <div className="mt-8 grid max-w-lg grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-3xl font-bold text-[var(--fsm-accent)]">
                {meals.length}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {t.total}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-3xl font-bold text-[var(--fsm-accent)]">
                {dates.length}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {t.days}
              </p>
            </div>
          </div>
        )}
      </section>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {loaded && meals.length === 0 && (
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--background)] px-6 py-12 text-center">
          <div
            aria-hidden="true"
            className="mb-4 text-5xl"
          >
            🍽️
          </div>

          <h2 className="text-xl font-bold text-[var(--foreground)]">
            {t.emptyTitle}
          </h2>

          <p className="mx-auto mt-3 max-w-md text-[var(--text-muted)]">
            {t.empty}
          </p>

          <Link
            href={`/${language}/recipes`}
            className="mt-6 inline-flex rounded-full border border-[var(--fsm-accent)] px-5 py-3 text-sm font-semibold text-[var(--fsm-accent)] hover:bg-[var(--surface-muted)]"
          >
            {t.browse}
          </Link>
        </section>
      )}

      {loaded && meals.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
            {t.upcoming}
          </h2>

          <div className="space-y-8">
            {dates.map((date) => (
              <section key={date}>
                <h3 className="mb-4 border-b border-[var(--border)] pb-3 text-lg font-bold capitalize text-[var(--foreground)]">
                  {formatDate(date, language)}
                </h3>

                <div className="grid gap-4">
                  {meals
                    .filter((meal) => meal.date === date)
                    .map((meal) => (
                      <article
                        key={meal.id}
                        className="flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm transition-shadow hover:shadow-md lg:flex-row lg:items-center"
                      >
                        {meal.imageUrl && (
                          <img
                            src={meal.imageUrl}
                            alt={meal.title}
                            loading="lazy"
                            className="h-32 w-full rounded-xl object-cover sm:h-36 lg:h-24 lg:w-32"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <h4 className="text-lg font-bold text-[var(--foreground)]">
                            {meal.title}
                          </h4>

                          <Link
                            href={`/${language}/recipes/${encodeURIComponent(meal.recipeId)}`}
                            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--fsm-accent)] hover:underline"
                          >
                            {t.view}
                            <span aria-hidden="true">→</span>
                          </Link>
                        </div>

                        <div className="flex flex-wrap items-end gap-3">
                          <div>
                            <label
                              htmlFor={`date-${meal.id}`}
                              className="mb-1 block text-xs font-medium text-[var(--text-muted)]"
                            >
                              {t.date}
                            </label>

                            <input
                              id={`date-${meal.id}`}
                              type="date"
                              value={meal.date}
                              onChange={(event) =>
                                editMeal(meal.id, {
                                  date: event.target.value,
                                })
                              }
                              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`type-${meal.id}`}
                              className="mb-1 block text-xs font-medium text-[var(--text-muted)]"
                            >
                              {t.meal}
                            </label>

                            <select
                              id={`type-${meal.id}`}
                              value={meal.mealType}
                              onChange={(event) =>
                                editMeal(meal.id, {
                                  mealType:
                                    event.target.value as MealType,
                                })
                              }
                              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                            >
                              {mealTypes.map((type) => (
                                <option key={type} value={type}>
                                  {t[type]}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeMeal(meal.id)
                            }
                            className="rounded-full border border-red-500 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            {t.remove}
                          </button>
                        </div>
                      </article>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 border-t border-[var(--border)] pt-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              {t.essentials}
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              {t.essentialsDescription}
            </p>
          </div>

          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
            {t.comingSoon}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {["🍳", "🥣", "🔪", "🛒"].map((symbol, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] text-4xl"
            >
              {symbol}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
