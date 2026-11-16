
import Link from "next/link";

import RecipeCard from "../recipes/RecipeCard";

import type { Recipe } from "../../types/recipe";
import type { Locale } from "../../lib/i18n/config";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface FeaturedRecipesProps {
  locale: Locale;
  dictionary: Dictionary;
}

interface SampleRecipe {
  id: string;
  imageUrl: string;
  category: Recipe["category"];
  names: Record<Locale, string>;
  descriptions: Record<Locale, string>;
}

const sampleRecipes: SampleRecipe[] = [
  {
    id: "sample-grilled-chicken",
    imageUrl: "/images/recipe-grilled-chicken.webp",
    category: "dinner",
    names: {
      en: "Mediterranean Grilled Chicken",
      es: "Pollo a la parrilla mediterráneo",
      "pt-BR": "Frango grelhado mediterrâneo",
    },
    descriptions: {
      en: "A colorful Mediterranean-inspired chicken dish.",
      es: "Un colorido plato de pollo de inspiración mediterránea.",
      "pt-BR": "Um prato colorido de frango inspirado no Mediterrâneo.",
    },
  },
  {
    id: "sample-tomato-pasta",
    imageUrl: "/images/recipe-tomato-pasta.webp",
    category: "dinner",
    names: {
      en: "Italian Tomato Pasta",
      es: "Pasta italiana con tomate",
      "pt-BR": "Macarrão italiano com tomate",
    },
    descriptions: {
      en: "A comforting pasta dish with tomato and basil.",
      es: "Una deliciosa pasta con tomate y albahaca.",
      "pt-BR": "Uma deliciosa massa com tomate e manjericão.",
    },
  },
  {
    id: "sample-greek-salad",
    imageUrl: "/images/recipe-greek-salad.webp",
    category: "lunch",
    names: {
      en: "Fresh Greek Salad",
      es: "Ensalada griega fresca",
      "pt-BR": "Salada grega fresca",
    },
    descriptions: {
      en: "Fresh vegetables inspired by Mediterranean flavors.",
      es: "Verduras frescas con sabores mediterráneos.",
      "pt-BR": "Vegetais frescos com sabores mediterrâneos.",
    },
  },
  {
    id: "sample-bean-stew",
    imageUrl: "/images/recipe-bean-stew.webp",
    category: "dinner",
    names: {
      en: "Rustic Mediterranean Bean Stew",
      es: "Guiso mediterráneo de frijoles",
      "pt-BR": "Ensopado mediterrâneo de feijão",
    },
    descriptions: {
      en: "A hearty bean dish inspired by home cooking.",
      es: "Un reconfortante guiso de frijoles casero.",
      "pt-BR": "Um ensopado de feijão inspirado na comida caseira.",
    },
  },
  {
    id: "sample-shrimp-pasta",
    imageUrl: "/images/recipe-shrimp-pasta.webp",
    category: "dinner",
    names: {
      en: "Mediterranean Shrimp Pasta",
      es: "Pasta mediterránea con camarones",
      "pt-BR": "Macarrão mediterrâneo com camarão",
    },
    descriptions: {
      en: "A Mediterranean-inspired seafood pasta.",
      es: "Una pasta con mariscos de inspiración mediterránea.",
      "pt-BR": "Uma massa com frutos do mar inspirada no Mediterrâneo.",
    },
  },
  {
    id: "sample-caprese-salad",
    imageUrl: "/images/recipe-caprese-salad.webp",
    category: "lunch",
    names: {
      en: "Classic Caprese Salad",
      es: "Ensalada caprese clásica",
      "pt-BR": "Salada caprese clássica",
    },
    descriptions: {
      en: "A fresh Italian-inspired tomato and mozzarella salad.",
      es: "Una ensalada italiana fresca de tomate y mozzarella.",
      "pt-BR": "Uma salada italiana fresca de tomate e muçarela.",
    },
  },
];

export default function FeaturedRecipes({
  locale,
  dictionary,
}: FeaturedRecipesProps) {
  const recipes: Recipe[] = sampleRecipes.map((item) => ({
    id: item.id,
    source: "api",
    title: item.names[locale],
    description: item.descriptions[locale],
    imageUrl: item.imageUrl,
    imageAlt: item.names[locale],
    ingredients: [],
    instructions: [],
    category: item.category,
    isFeatured: true,
  }));

  return (
    <section
      id="featured-recipes"
      aria-labelledby="featured-recipes-title"
      className="section-spacing bg-[var(--surface-muted)]"
    >
      <div className="site-container">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2
              id="featured-recipes-title"
              className="mb-3 text-3xl font-bold text-[var(--foreground)] sm:text-4xl"
            >
              {dictionary.recipes.featuredTitle}
            </h2>

            <p className="text-lg text-[var(--text-muted)]">
              {dictionary.recipes.featuredDescription}
            </p>
          </div>

          <Link
            href={`/${locale}/recipes`}
            className="btn-primary self-start"
          >
            {dictionary.recipes.viewAll}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              locale={locale}
              dictionary={dictionary}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
