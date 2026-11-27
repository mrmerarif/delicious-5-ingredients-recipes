
import Image from "next/image";
import Link from "next/link";

import type { Recipe } from "../../types/recipe";
import type { Locale } from "../../lib/i18n/config";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface RecipeCardProps {
  recipe: Recipe;
  locale: Locale;
  dictionary: Dictionary;
}

export default function RecipeCard({
  recipe,
  locale,
  dictionary,
}: RecipeCardProps) {
  const recipeHref =
    `/${locale}/recipes/${encodeURIComponent(recipe.id)}`;

  const totalMinutes =
    recipe.totalMinutes ??
    (recipe.preparationMinutes !== undefined &&
    recipe.cookingMinutes !== undefined
      ? recipe.preparationMinutes +
        recipe.cookingMinutes
      : undefined);

  return (
    <article className="recipe-card group flex h-full flex-col">
      <Link
        href={recipeHref}
        aria-label={`${dictionary.recipes.viewRecipe}: ${recipe.title}`}
        className="relative block aspect-[4/3] overflow-hidden bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--fsm-accent)]"
      >
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.imageAlt || recipe.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
            {dictionary.recipes.notAvailable}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-xl font-bold text-[var(--foreground)]">
          <Link
            href={recipeHref}
            className="transition-colors hover:text-[var(--fsm-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fsm-accent)]"
          >
            {recipe.title}
          </Link>
        </h3>

        {recipe.description && (
          <p className="line-clamp-2 text-sm text-[var(--text-muted)]">
            {recipe.description}
          </p>
        )}

        {totalMinutes !== undefined && (
          <p className="text-sm font-medium text-[var(--text-muted)]">
            {dictionary.recipes.totalTime}: {totalMinutes}{" "}
            {dictionary.recipes.minutes}
          </p>
        )}

        <div className="mt-auto pt-3">
          <Link
            href={recipeHref}
            className="btn-primary w-full"
            aria-label={`${dictionary.recipes.viewRecipe}: ${recipe.title}`}
          >
            {dictionary.recipes.viewRecipe}
          </Link>
        </div>
      </div>
    </article>
  );
}
