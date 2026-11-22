
import "server-only";

import type {
  Recipe,
  RecipeIngredient,
} from "../../types/recipe";

interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string | null;
  strInstructions: string | null;
  strCategory: string | null;
  strSource: string | null;
  strArea: string | null;
  [key: string]: string | null;
}

interface MealDBResponse {
  meals: MealDBMeal[] | null;
}

function extractIngredients(
  meal: MealDBMeal
): RecipeIngredient[] {
  const ingredients: RecipeIngredient[] = [];

  for (let index = 1; index <= 20; index++) {
    const name = meal[`strIngredient${index}`]?.trim();
    const measurement =
      meal[`strMeasure${index}`]?.trim();

    if (!name) {
      continue;
    }

    ingredients.push({
      name,
      originalText: [measurement, name]
        .filter(Boolean)
        .join(" "),
    });
  }

  return ingredients;
}

function extractInstructions(
  instructions: string | null
): string[] {
  if (!instructions) {
    return [];
  }

  return instructions
    .split(/\r?\n+/)
    .map((step) => step.trim())
    .filter(Boolean);
}

export async function getRecipeById(
  id: string
): Promise<Recipe | null> {
  if (!/^\d+$/.test(id)) {
    return null;
  }

  const url = new URL(
    "https://www.themealdb.com/api/json/v1/1/lookup.php"
  );

  url.searchParams.set("i", id);

  try {
    const response = await fetch(url.toString(), {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.error(
        "TheMealDB recipe lookup failed:",
        response.status
      );
      return null;
    }

    const data =
      (await response.json()) as MealDBResponse;

    const meal = data.meals?.[0];

    if (!meal) {
      return null;
    }

    return {
      id: meal.idMeal,
      source: "api",
      title: meal.strMeal,
      description: meal.strArea
        ? `${meal.strArea} cuisine`
        : undefined,
      imageUrl: meal.strMealThumb ?? undefined,
      imageAlt: meal.strMeal,
      ingredients: extractIngredients(meal),
      instructions: extractInstructions(
        meal.strInstructions
      ),
      category: "other",
      sourceUrl: meal.strSource ?? undefined,
    };
  } catch (error) {
    console.error(
      "Unable to retrieve recipe details:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return null;
  }
}
