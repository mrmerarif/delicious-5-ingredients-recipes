
/**
 * Delicious 5 Ingredients Recipes
 * Localized recipe coordinator.
 *
 * Retrieves recipes, checks stored translations,
 * and optionally requests and saves translations.
 */

import "server-only";

import { createHash } from "node:crypto";

import type { Locale } from "../i18n/config";
import type { Recipe } from "../../types/recipe";

import { getRecipeById } from "./getRecipeById";

import {
  getCachedTranslation,
  saveTranslation,
} from "../translation/cache";

import {
  googleTranslationProvider,
} from "../translation/google";

export function createRecipeHash(
  recipe: Recipe
): string {
  const sourceContent = JSON.stringify({
    title: recipe.title,
    description: recipe.description ?? "",
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
  });

  return createHash("sha256")
    .update(sourceContent)
    .digest("hex");
}

async function translateRecipe(
  recipe: Recipe,
  locale: Locale
): Promise<Recipe> {
  const texts = [
    recipe.title,
    recipe.description ?? "",
    ...recipe.ingredients.map(
      (ingredient) => ingredient.name
    ),
    ...recipe.ingredients.map(
      (ingredient) =>
        ingredient.originalText ?? ""
    ),
    ...recipe.instructions,
  ];

  // Avoid sending empty strings for translation.
  const nonEmptyTexts = texts.filter(
    (text) => text.trim().length > 0
  );

  const result =
    await googleTranslationProvider.translate({
      texts: nonEmptyTexts,
      sourceLocale: "en",
      targetLocale: locale,
    });

  let translatedIndex = 0;

  const translatedTexts = texts.map((text) =>
    text.trim().length > 0
      ? result.texts[translatedIndex++]
      : text
  );

  let index = 0;

  const title = translatedTexts[index++];
  const description = translatedTexts[index++];

  const ingredientNames = recipe.ingredients.map(
    () => translatedTexts[index++]
  );

  const ingredientTexts = recipe.ingredients.map(
    () => translatedTexts[index++]
  );

  const instructions = recipe.instructions.map(
    () => translatedTexts[index++]
  );

  return {
    ...recipe,
    title,
    description: description || undefined,
    imageAlt: title,

    ingredients: recipe.ingredients.map(
      (ingredient, ingredientIndex) => ({
        ...ingredient,
        name: ingredientNames[ingredientIndex],
        originalText:
          ingredientTexts[ingredientIndex] ||
          undefined,
      })
    ),

    instructions,
  };
}

export async function getLocalizedRecipe(
  id: string,
  locale: Locale
): Promise<Recipe | null> {
  const recipe = await getRecipeById(id);

  if (!recipe) {
    return null;
  }

  if (locale === "en") {
    return recipe;
  }

  const sourceHash = createRecipeHash(recipe);

  const cached = await getCachedTranslation(
    recipe,
    locale,
    sourceHash
  );

  if (cached) {
    return cached;
  }

  if (
    process.env.ENABLE_AUTOMATIC_RECIPE_TRANSLATION !==
    "true"
  ) {
    return recipe;
  }

  try {
    const translatedRecipe =
      await translateRecipe(recipe, locale);

    await saveTranslation({
      recipe: translatedRecipe,
      locale,
      sourceHash,
      method: "automatic",
    });

    return translatedRecipe;
  } catch (error) {
    console.error(
      "Unable to translate recipe:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return recipe;
  }
}
