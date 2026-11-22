
"use client";

import { useSyncExternalStore } from "react";

import type {
  Recipe,
  RecipeIngredient,
} from "../../types/recipe";

import type { Dictionary } from "../../lib/i18n/dictionaries";

interface RecipeIngredientsProps {
  recipe: Recipe;
  dictionary: Dictionary;
}

const STORAGE_EVENT = "delicious5:ingredients-updated";

function formatIngredient(
  ingredient: RecipeIngredient
): string {
  if (ingredient.originalText) {
    return ingredient.originalText;
  }

  return [
    ingredient.quantity,
    ingredient.unit,
    ingredient.name,
  ]
    .filter(
      (part) =>
        part !== undefined &&
        part !== null &&
        part !== ""
    )
    .join(" ");
}

function getStorageKey(recipe: Recipe): string {
  return `delicious5:recipe:${recipe.source}:${recipe.id}:ingredients`;
}

function subscribeToStorage(
  callback: () => void
): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function readStoredIngredients(
  storageKey: string
): string {
  try {
    return window.localStorage.getItem(storageKey) ?? "[]";
  } catch {
    return "[]";
  }
}

function saveIngredients(
  storageKey: string,
  checked: boolean[]
): void {
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(checked)
    );

    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // Browser storage may be unavailable.
  }
}

export default function RecipeIngredients({
  recipe,
  dictionary,
}: RecipeIngredientsProps) {
  const storageKey = getStorageKey(recipe);

  const storedValue = useSyncExternalStore(
    subscribeToStorage,
    () => readStoredIngredients(storageKey),
    () => "[]"
  );

  let savedChecks: boolean[] = [];

  try {
    const parsed: unknown = JSON.parse(storedValue);

    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "boolean")
    ) {
      savedChecks = parsed;
    }
  } catch {
    savedChecks = [];
  }

  const checkedIngredients = recipe.ingredients.map(
    (_, index) => savedChecks[index] ?? false
  );

  function toggleIngredient(index: number) {
    const updated = checkedIngredients.map(
      (checked, ingredientIndex) =>
        ingredientIndex === index ? !checked : checked
    );

    saveIngredients(storageKey, updated);
  }

  function clearAllIngredients() {
    const cleared = recipe.ingredients.map(() => false);

    saveIngredients(storageKey, cleared);
  }

  const availableCount =
    checkedIngredients.filter(Boolean).length;

  const missingCount =
    recipe.ingredients.length - availableCount;

  return (
    <section aria-labelledby="recipe-ingredients-title">
      <div className="mb-6 flex flex-col items-start gap-1">
        <h2
          id="recipe-ingredients-title"
          className="text-2xl font-bold text-[var(--foreground)]"
        >
          {dictionary.recipes.ingredients}
        </h2>

        <span className="text-xs font-medium text-[var(--text-muted)]">
          {dictionary.recipes.haveIngredient}
        </span>
      </div>

      <ul className="space-y-3">
        {recipe.ingredients.map((ingredient, index) => {
          const checked = checkedIngredients[index];

          return (
            <li
              key={`${ingredient.name}-${index}`}
              className="rounded-lg bg-[var(--surface-muted)] p-3 text-[var(--foreground)]"
            >
              <label className="flex cursor-pointer items-center gap-3">
                <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleIngredient(index)}
                    aria-label={`${dictionary.recipes.haveIngredient}: ${ingredient.name}`}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-400 bg-white transition-colors checked:border-[var(--fsm-accent)] checked:bg-[var(--fsm-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fsm-accent)]"
                  />

                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
                  >
                    <path
                      d="M3.5 8L6.5 11L12.5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span className="text-sm leading-relaxed">
                  {formatIngredient(ingredient)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div
        className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]"
        aria-live="polite"
      >
        <span>
          <strong className="text-[var(--foreground)]">
            {availableCount}
          </strong>{" "}
          {dictionary.recipes.availableCount}
        </span>

        <span>
          <strong className="text-[var(--foreground)]">
            {missingCount}
          </strong>{" "}
          {dictionary.recipes.missingCount}
        </span>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={clearAllIngredients}
          disabled={availableCount === 0}
          className="text-sm font-medium text-[var(--fsm-accent)] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
        >
          {dictionary.search.clearAll}
        </button>
      </div>
    </section>
  );
}
