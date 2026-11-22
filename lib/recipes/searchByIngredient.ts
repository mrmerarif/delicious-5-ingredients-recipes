// Backend logic for the Single Ingredient Search.
// Uses TheMealDB (free, no sign-up; "1" is their public test key).
// If the team picks a different recipe API, only this file needs to change.

export type RecipeSummary = {
  id: string;
  title: string;
  image: string;
  source: "themealdb";
};

type MealDbFilterResponse = {
  meals: { idMeal: string; strMeal: string; strMealThumb: string }[] | null;
};

const BASE_URL =
  process.env.RECIPE_API_BASE_URL ?? "https://www.themealdb.com/api/json/v1/1";

/** Normalizes user input: "Chicken Breast " -> "chicken_breast" (TheMealDB format). */
export function normalizeIngredient(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "_");
}

export async function searchByIngredient(
  ingredient: string
): Promise<RecipeSummary[]> {
  const query = normalizeIngredient(ingredient);
  const url = `${BASE_URL}/filter.php?i=${encodeURIComponent(query)}`;

  // Cache each ingredient's results for 1 hour to stay fast and polite to the API.
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Recipe API responded with ${res.status}`);
  }

  const data = (await res.json()) as MealDbFilterResponse;

  // TheMealDB returns { meals: null } when nothing matches.
  return (data.meals ?? []).map((meal) => ({
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    source: "themealdb",
  }));
}
