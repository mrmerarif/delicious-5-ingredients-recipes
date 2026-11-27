
import RecipeCookingExperience from "./RecipeCookingExperience";

import type { Recipe } from "../../types/recipe";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface RecipeDetailsProps {
  recipe: Recipe;
  dictionary: Dictionary;
}

export default function RecipeDetails({
  recipe,
  dictionary,
}: RecipeDetailsProps) {
  return (
    <RecipeCookingExperience
      recipe={recipe}
      dictionary={dictionary}
    />
  );
}
