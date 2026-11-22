
/**
 * Delicious 5 Ingredients Recipes
 * Localized recipe coordinator.
 *
 * Retrieves recipes, checks stored translations,
 * and optionally requests automatic translation.
 */

import "server-only";

import { createHash } from "node:crypto";

import type { Locale } from "../i18n/config";
import type { Recipe } from "../../types/recipe";

import { getRecipeById } from "./getRecipeById";
import { getCachedTranslation } from "../translation/cache";
import { googleTranslationProvider } from "../translation/google";

function createRecipeHash(recipe: Recipe): string {
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
      (ingredient) => ingredient.originalText ?? ""
    ),
    ...recipe.instructions,
  ];

  const result = await googleTranslationProvider.translate({
    texts,
    sourceLocale: "en",
    targetLocale: locale,
  });

  let index = 0;

  const title = result.texts[index++];
  const description = result.texts[index++];

  const ingredientNames = recipe.ingredients.map(
    () => result.texts[index++]
  );

  const ingredientTexts = recipe.ingredients.map(
    () => result.texts[index++]
  );

  const instructions = recipe.instructions.map(
    () => result.texts[index++]
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
          ingredientTexts[ingredientIndex] || undefined,
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

  // Translation is disabled until we configure
  // credentials, quotas, and cost controls.
  if (
    process.env.ENABLE_AUTOMATIC_RECIPE_TRANSLATION !==
    "true"
  ) {
    return recipe;
  }

  try {
    return await translateRecipe(recipe, locale);
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

