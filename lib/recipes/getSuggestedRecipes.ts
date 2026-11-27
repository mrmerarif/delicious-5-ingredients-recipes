
/**
 * Delicious 5 Ingredients Recipes
 * Suggested Recipes recommendation service.
 *
 * Ranks related recipes using important ingredients,
 * provider categories, and cuisine.
 */

import "server-only";

import type {
  Recipe,
  SuggestedRecipe,
} from "../../types/recipe";

import { getRecipeById } from "./getRecipeById";
import { findRecipes } from "./search";

import {
  normalizeIngredient,
  type RecipeSummary,
} from "./searchByIngredient";

const MAX_SUGGESTIONS = 8;
const MAX_SEARCH_INGREDIENTS = 4;
const MAX_CANDIDATES_TO_VERIFY = 16;

const COMMON_INGREDIENTS = new Set([
  "salt",
  "sea_salt",
  "pepper",
  "black_pepper",
  "white_pepper",
  "salt_and_pepper",
  "water",
  "oil",
  "olive_oil",
  "vegetable_oil",
  "cooking_oil",
  "sesame_oil",
  "sunflower_oil",
  "canola_oil",
  "sugar",
  "brown_sugar",
  "caster_sugar",
  "white_sugar",
  "butter",
  "unsalted_butter",
  "flour",
  "plain_flour",
  "all-purpose_flour",
  "all_purpose_flour",
  "cornflour",
  "cornstarch",
  "baking_powder",
  "baking_soda",
  "garlic",
  "garlic_powder",
  "onion_powder",
  "vinegar",
  "soy_sauce",
  "dark_soy_sauce",
  "light_soy_sauce",
]);

const MAIN_INGREDIENT_PATTERN =
  /chicken|beef|pork|lamb|turkey|salmon|tuna|cod|fish|prawn|shrimp|tofu|duck|lentil|chickpea|bean|eggplant|mushroom|potato|rice|pasta|noodle/;

function normalizeValue(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function isDessert(category?: string): boolean {
  return normalizeValue(category) === "dessert";
}

function getSafeImageUrl(
  value?: string
): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol === "https:" &&
      url.hostname === "www.themealdb.com" &&
      url.pathname.startsWith("/images/media/meals/")
    ) {
      return url.href;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getImportantIngredients(
  recipe: Recipe
): string[] {
  const ingredients = [
    ...new Set(
      recipe.ingredients
        .map((ingredient) =>
          normalizeIngredient(ingredient.name)
        )
        .filter(
          (ingredient) =>
            ingredient &&
            !COMMON_INGREDIENTS.has(ingredient)
        )
    ),
  ];

  const mainIngredients = ingredients.filter(
    (ingredient) =>
      MAIN_INGREDIENT_PATTERN.test(ingredient)
  );

  const secondaryIngredients = ingredients.filter(
    (ingredient) =>
      !MAIN_INGREDIENT_PATTERN.test(ingredient)
  );

  return [
    ...mainIngredients,
    ...secondaryIngredients,
  ].slice(0, MAX_SEARCH_INGREDIENTS);
}

function getIngredientWeight(
  ingredient: string,
  index: number
): number {
  if (
    index === 0 &&
    MAIN_INGREDIENT_PATTERN.test(ingredient)
  ) {
    return 10;
  }

  return 4;
}

export async function getSuggestedRecipes(
  recipeId: string,
  limit = MAX_SUGGESTIONS
): Promise<SuggestedRecipe[]> {
  const recipe = await getRecipeById(recipeId);

  if (!recipe) {
    return [];
  }

  const safeLimit = Number.isFinite(limit)
    ? Math.max(
        1,
        Math.min(
          MAX_SUGGESTIONS,
          Math.floor(limit)
        )
      )
    : MAX_SUGGESTIONS;

  const ingredients =
    getImportantIngredients(recipe);

  const candidates =
    new Map<string, SuggestedRecipe>();

  function addCandidate(
    item: RecipeSummary,
    score: number
  ) {
    if (
      !item.id ||
      !item.title ||
      item.id === recipeId
    ) {
      return;
    }

    const existing = candidates.get(item.id);

    if (existing) {
      existing.matchScore += score;
      return;
    }

    candidates.set(item.id, {
      id: item.id,
      title: item.title,
      imageUrl: getSafeImageUrl(item.image),
      imageAlt: item.title,
      matchScore: score,
    });
  }

  // Reuse the team's existing search service.
  const ingredientRequests = ingredients.map(
    (ingredient) =>
      findRecipes("", [ingredient], "")
  );

  const categoryRequest = recipe.providerCategory
    ? findRecipes("", [], recipe.providerCategory)
    : Promise.resolve<RecipeSummary[]>([]);

  const [ingredientResults, categoryResults] =
    await Promise.all([
      Promise.allSettled(ingredientRequests),
      Promise.allSettled([categoryRequest]),
    ]);

  // Give important ingredients greater weight.
  ingredientResults.forEach((result, index) => {
    if (result.status !== "fulfilled") {
      return;
    }

    const weight = getIngredientWeight(
      ingredients[index],
      index
    );

    for (const item of result.value) {
      addCandidate(item, weight);
    }
  });

  // Prioritize recipes from the same category.
  for (const result of categoryResults) {
    if (result.status === "fulfilled") {
      for (const item of result.value) {
        addCandidate(item, 8);
      }
    }
  }

  // Select promising candidates before retrieving
  // additional recipe details.
  const preliminaryResults = [
    ...candidates.values(),
  ]
    .sort(
      (first, second) =>
        second.matchScore - first.matchScore ||
        Number(Boolean(second.imageUrl)) -
          Number(Boolean(first.imageUrl)) ||
        first.id.localeCompare(second.id)
    )
    .slice(0, MAX_CANDIDATES_TO_VERIFY);

  const sourceCategory = normalizeValue(
    recipe.providerCategory
  );

  const sourceCuisine = normalizeValue(
    recipe.cuisine
  );

  const verifiedResults: SuggestedRecipe[] = [];

  // Verify candidates in small batches to avoid
  // sending too many simultaneous API requests.
  const batchSize = 4;

  for (
    let index = 0;
    index < preliminaryResults.length;
    index += batchSize
  ) {
    const batch = preliminaryResults.slice(
      index,
      index + batchSize
    );

    const details = await Promise.allSettled(
      batch.map((candidate) =>
        getRecipeById(candidate.id)
      )
    );

    details.forEach((result, batchIndex) => {
      if (
        result.status !== "fulfilled" ||
        !result.value
      ) {
        return;
      }

      const candidate = batch[batchIndex];
      const candidateRecipe = result.value;

      const candidateCategory = normalizeValue(
        candidateRecipe.providerCategory
      );

      const candidateCuisine = normalizeValue(
        candidateRecipe.cuisine
      );

      // Avoid mixing desserts with main dishes.
      if (
        sourceCategory &&
        candidateCategory &&
        isDessert(sourceCategory) !==
          isDessert(candidateCategory)
      ) {
        return;
      }

      let score = candidate.matchScore;

      // Reward matching cuisine.
      if (
        sourceCuisine &&
        sourceCuisine === candidateCuisine
      ) {
        score += 5;
      }

      // Reduce the priority of unrelated categories.
      if (
        sourceCategory &&
        candidateCategory &&
        sourceCategory !== candidateCategory
      ) {
        score -= 3;
      }

      if (score <= 0) {
        return;
      }

      verifiedResults.push({
        id: candidate.id,
        title: candidateRecipe.title,
        imageUrl:
          getSafeImageUrl(candidateRecipe.imageUrl) ??
          candidate.imageUrl,
        imageAlt: candidateRecipe.title,
        matchScore: score,
      });
    });
  }

  return verifiedResults
    .sort(
      (first, second) =>
        second.matchScore - first.matchScore ||
        Number(Boolean(second.imageUrl)) -
          Number(Boolean(first.imageUrl)) ||
        first.id.localeCompare(second.id)
    )
    .slice(0, safeLimit);
}
