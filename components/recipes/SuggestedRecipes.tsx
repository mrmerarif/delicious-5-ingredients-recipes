
/**
 * Delicious 5 Ingredients Recipes
 * Server-rendered suggested recipes section.
 */

import RecipeCarousel from "./RecipeCarousel";

import {
  getSuggestedRecipes,
} from "../../lib/recipes/getSuggestedRecipes";

import {
  getLocalizedRecipeTitles,
} from "../../lib/recipes/getLocalizedRecipeTitles";

import type { Recipe } from "../../types/recipe";
import type { Locale } from "../../lib/i18n/config";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface SuggestedRecipesProps {
  recipeId: string;
  locale: Locale;
  dictionary: Dictionary;
}

export default async function SuggestedRecipes({
  recipeId,
  locale,
  dictionary,
}: SuggestedRecipesProps) {
  try {
    const suggestions =
      await getSuggestedRecipes(recipeId, 8);

    if (!suggestions.length) {
      return null;
    }

    const localizedSuggestions =
      await getLocalizedRecipeTitles(
        suggestions,
        locale
      );

    const recipes: Recipe[] =
      localizedSuggestions.map(
        (suggestion) => ({
          id: suggestion.id,
          source: "api",
          title: suggestion.title,
          imageUrl: suggestion.imageUrl,
          imageAlt:
            suggestion.imageAlt ??
            suggestion.title,
          ingredients: [],
          instructions: [],
        })
      );

    return (
      <RecipeCarousel
        recipes={recipes}
        locale={locale}
        dictionary={dictionary}
        title={dictionary.recipes.suggestedTitle}
        description={
          dictionary.recipes.suggestedDescription
        }
        storageKey={
          `delicious-recipes:carousel:suggested:${recipeId}`
        }
      />
    );
  } catch (error) {
    console.error(
      "Unable to load suggested recipes:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return null;
  }
}
