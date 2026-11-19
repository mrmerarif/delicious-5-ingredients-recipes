import "server-only";
import { normalizeIngredient, type RecipeSummary } from "./searchByIngredient";

type Meal = { idMeal: string; strMeal: string; strMealThumb?: string };
const base = (process.env.RECIPE_API_BASE_URL ?? "https://www.themealdb.com/api/json/v1/1").replace(/\/$/, "");

async function meals<T>(endpoint: string, key: string, value: string): Promise<T[]> {
  const response = await fetch(`${base}/${endpoint}.php?${new URLSearchParams({ [key]: value })}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`TheMealDB returned ${response.status}`);
  const data = await response.json();
  if (data.meals === null) return [];
  if (!Array.isArray(data.meals)) throw new Error("Unexpected TheMealDB response");
  return data.meals;
}

export async function getIngredients() {
  const rows = await meals<{ strIngredient: string }>("list", "i", "list");
  return [...new Set(rows.map((row) => row.strIngredient).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export async function getCategories() {
  const rows = await meals<{ strCategory: string }>("list", "c", "list");
  return rows.map((row) => row.strCategory).filter(Boolean).sort();
}

export const maxIngredients = 5;

export async function findRecipes(query: string, ingredients: string[], category: string): Promise<RecipeSummary[]> {
  const requests = ingredients.map((ingredient) => meals<Meal>("filter", "i", normalizeIngredient(ingredient)));
  if (query) requests.unshift(meals<Meal>("search", "s", query));
  if (category) requests.push(meals<Meal>("filter", "c", category));

  let matches: Meal[];
  if (requests.length) {
    const [first, ...rest] = await Promise.all(requests);
    const ids = rest.map((list) => new Set(list.map((meal) => meal.idMeal)));
    matches = first.filter((meal) => ids.every((set) => set.has(meal.idMeal)));
  } else {
    const defaults = await Promise.allSettled(
      ["52772", "52771", "52977", "52854", "52874", "53013"].map((id) => meals<Meal>("lookup", "i", id)),
    );
    matches = defaults.flatMap((result) => result.status === "fulfilled" ? result.value : []);
    if (!matches.length) throw new Error("Default recipes unavailable");
  }

  return [...new Map(matches.map((meal) => [meal.idMeal, meal])).values()].map((meal) => ({
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb ?? "",
    source: "themealdb",
  }));
}
