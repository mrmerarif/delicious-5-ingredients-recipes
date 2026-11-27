
/**
 * Delicious 5 Ingredients Recipes
 * Lightweight recipe title localization.
 */

import "server-only";

import { cacheLife } from "next/cache";

import type { Locale } from "../i18n/config";
import type { SuggestedRecipe } from "../../types/recipe";

import { getRecipeById } from "./getRecipeById";

import {
  createRecipeHash,
} from "./getLocalizedRecipe";

import {
  getCachedTranslation,
} from "../translation/cache";

import {
  googleTranslationProvider,
} from "../translation/google";

async function translateTitles(
  titles: string[],
  locale: Locale
): Promise<string[]> {
  "use cache";

  cacheLife("days");

  const result =
    await googleTranslationProvider.translate({
      texts: titles,
      sourceLocale: "en",
      targetLocale: locale,
    });

  return result.texts;
}

export async function getLocalizedRecipeTitles<
  T extends Pick<
    SuggestedRecipe,
    "id" | "title" | "imageAlt"
  >
>(
  recipes: T[],
  locale: Locale
): Promise<T[]> {
  if (locale === "en" || !recipes.length) {
    return recipes;
  }

  const localizedRecipes = await Promise.all(
    recipes.map(async (recipe) => {
      try {
        const originalRecipe =
          await getRecipeById(recipe.id);

        if (!originalRecipe) {
          return {
            recipe,
            translated: false,
          };
        }

        const cached =
          await getCachedTranslation(
            originalRecipe,
            locale,
            createRecipeHash(originalRecipe)
          );

        if (cached?.title) {
          return {
            recipe: {
              ...recipe,
              title: cached.title,
              imageAlt: cached.title,
            },
            translated: true,
          };
        }
      } catch {
        // Continue using the original title.
      }

      return {
        recipe,
        translated: false,
      };
    })
  );

  if (
    process.env.ENABLE_AUTOMATIC_RECIPE_TRANSLATION !==
    "true"
  ) {
    return localizedRecipes.map(
      (item) => item.recipe
    );
  }

  const missing = localizedRecipes.filter(
    (item) => !item.translated
  );

  if (!missing.length) {
    return localizedRecipes.map(
      (item) => item.recipe
    );
  }

  try {
    const titles = [
      ...new Set(
        missing.map((item) => item.recipe.title)
      ),
    ];

    const translatedTitles =
      await translateTitles(titles, locale);

    const titleMap = new Map(
      titles.map((title, index) => [
        title,
        translatedTitles[index] || title,
      ])
    );

    return localizedRecipes.map((item) => {
      if (item.translated) {
        return item.recipe;
      }

      const title =
        titleMap.get(item.recipe.title) ??
        item.recipe.title;

      return {
        ...item.recipe,
        title,
        imageAlt: title,
      };
    });
  } catch (error) {
    console.error(
      "Unable to translate recipe titles:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return localizedRecipes.map(
      (item) => item.recipe
    );
  }
}
