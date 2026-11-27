
"use client";

import { useSyncExternalStore } from "react";

import type { Recipe } from "../../types/recipe";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface CookingDashboardProps {
  recipe: Recipe;
  dictionary: Dictionary;
}

const STORAGE_EVENT = "delicious5:ingredients-updated";

function getStorageKey(recipe: Recipe): string {
  return `delicious5:recipe:${recipe.source}:${recipe.id}:ingredients`;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function readStorage(storageKey: string): string {
  try {
    return window.localStorage.getItem(storageKey) ?? "[]";
  } catch {
    return "[]";
  }
}

export default function CookingDashboard({
  recipe,
  dictionary,
}: CookingDashboardProps) {
  const storageKey = getStorageKey(recipe);

  const storedValue = useSyncExternalStore(
    subscribe,
    () => readStorage(storageKey),
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

  const total = recipe.ingredients.length;

  const available = recipe.ingredients.reduce(
    (count, _, index) =>
      count + (savedChecks[index] === true ? 1 : 0),
    0
  );

  const missing = total - available;

  const percentage =
    total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <aside
      aria-label={dictionary.search.match}
      className="mt-6 rounded-2xl border border-[var(--surface-muted)] bg-[var(--background)] p-5"
    >
      <h2 className="text-lg font-bold text-[var(--foreground)]">
        {dictionary.search.match}
      </h2>

      <div className="mt-4 flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums text-[var(--foreground)]">
          {available} / {total}
        </span>

        <span className="text-sm text-[var(--text-muted)]">
          {dictionary.recipes.availableCount}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={dictionary.search.match}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"
      >
        <div
          className="h-full rounded-full bg-[var(--fsm-accent)] transition-[width] duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-[var(--text-muted)]">
        <span>
          {missing} {dictionary.recipes.missingCount}
        </span>

        <span className="tabular-nums">
          {percentage}%
        </span>
      </div>
    </aside>
  );
}
