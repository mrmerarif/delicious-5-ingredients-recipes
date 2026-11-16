
/**
 * Delicious 5 Ingredients Recipes
 * Shared recipe data types.
 *
 * Used by the frontend, recipe API integration,
 * and Supabase data mapping.
 */

export type RecipeSource = "api" | "supabase";

export type MealCategory =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "dessert"
  | "other";

export interface RecipeIngredient {
  name: string;
  quantity?: number;
  unit?: string;
  originalText?: string;
}

export interface Recipe {
  id: string;
  source: RecipeSource;

  title: string;
  description?: string;

  imageUrl?: string;
  imageAlt?: string;

  ingredients: RecipeIngredient[];
  instructions: string[];

  preparationMinutes?: number;
  cookingMinutes?: number;
  totalMinutes?: number;

  servings?: number;
  category?: MealCategory;

  isFeatured?: boolean;
  visitCount?: number;

  sourceUrl?: string;
}

export interface RecipeSearchParams {
  ingredients: string[];
  category?: MealCategory;
  maxCookingMinutes?: number;
  page?: number;
  pageSize?: number;
}

export interface RecipeSearchResult {
  recipes: Recipe[];
  totalResults: number;
  page: number;
  hasMore: boolean;
}
