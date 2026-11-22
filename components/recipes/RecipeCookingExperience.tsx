
"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";

import CookingDashboard from "./CookingDashboard";
import CookingMode from "./CookingMode";
import RecipeIngredients from "./RecipeIngredients";
import RecipeInstructions from "./RecipeInstructions";

import type { Recipe } from "../../types/recipe";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface RecipeCookingExperienceProps {
  recipe: Recipe;
  dictionary: Dictionary;
}

const COOKING_MODE_EVENT =
  "delicious5:cooking-mode-updated";

function getCookingModeStorageKey(recipe: Recipe): string {
  return `delicious5:cooking-mode:${recipe.source}:${recipe.id}`;
}

function subscribeToCookingMode(
  callback: () => void
): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(COOKING_MODE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(COOKING_MODE_EVENT, callback);
  };
}

function readCookingMode(storageKey: string): string {
  try {
    return window.localStorage.getItem(storageKey) ?? "false";
  } catch {
    return "false";
  }
}

function saveCookingMode(
  storageKey: string,
  isOpen: boolean
): void {
  try {
    window.localStorage.setItem(
      storageKey,
      String(isOpen)
    );

    window.dispatchEvent(
      new Event(COOKING_MODE_EVENT)
    );
  } catch {
    // Browser storage may be unavailable.
  }
}

export default function RecipeCookingExperience({
  recipe,
  dictionary,
}: RecipeCookingExperienceProps) {
  const cookingModeStorageKey =
    getCookingModeStorageKey(recipe);

  const storedCookingMode = useSyncExternalStore(
    subscribeToCookingMode,
    () => readCookingMode(cookingModeStorageKey),
    () => "false"
  );

  const isCookingModeOpen =
    storedCookingMode === "true";

  function openCookingMode() {
    saveCookingMode(cookingModeStorageKey, true);
  }

  function closeCookingMode() {
    saveCookingMode(cookingModeStorageKey, false);
  }

  const totalMinutes =
    recipe.totalMinutes ??
    (recipe.preparationMinutes !== undefined &&
    recipe.cookingMinutes !== undefined
      ? recipe.preparationMinutes + recipe.cookingMinutes
      : undefined);

  const recipeFacts = [
    {
      label: dictionary.recipes.prepTime,
      value: recipe.preparationMinutes,
      unit: dictionary.recipes.minutes,
    },
    {
      label: dictionary.recipes.cookTime,
      value: recipe.cookingMinutes,
      unit: dictionary.recipes.minutes,
    },
    {
      label: dictionary.recipes.totalTime,
      value: totalMinutes,
      unit: dictionary.recipes.minutes,
    },
    {
      label: dictionary.recipes.servings,
      value: recipe.servings,
      unit: "",
    },
  ].filter(
    (fact) => fact.value !== undefined
  );

  return (
    <article>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--surface-muted)]">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.imageAlt || recipe.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
              {dictionary.recipes.notAvailable}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-bold text-[var(--foreground)]">
            {recipe.title}
          </h1>

          {recipe.description && (
            <p className="mt-5 text-lg leading-relaxed text-[var(--text-muted)]">
              {recipe.description}
            </p>
          )}

          {recipeFacts.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4">
              {recipeFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-xl bg-[var(--surface-muted)] p-4"
                >
                  <p className="text-sm text-[var(--text-muted)]">
                    {fact.label}
                  </p>

                  <p className="mt-1 text-lg font-bold text-[var(--foreground)]">
                    {fact.value} {fact.unit}
                  </p>
                </div>
              ))}
            </div>
          )}

          <CookingDashboard
            recipe={recipe}
            dictionary={dictionary}
          />
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <RecipeIngredients
            recipe={recipe}
            dictionary={dictionary}
          />
        </div>

        <div className="lg:col-span-2">
          {isCookingModeOpen ? (
            <CookingMode
              recipe={recipe}
              dictionary={dictionary}
              onClose={closeCookingMode}
            />
          ) : (
            <RecipeInstructions
              recipe={recipe}
              dictionary={dictionary}
              onStartCooking={openCookingMode}
            />
          )}
        </div>
      </div>
    </article>
  );
}
