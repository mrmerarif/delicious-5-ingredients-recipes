
"use client";

import { useSyncExternalStore } from "react";

import type { Recipe } from "../types/recipe";

const STORAGE_EVENT = "delicious5:cooking-progress-updated";

function getStorageKey(recipe: Recipe): string {
  return `delicious5:cooking-steps:${recipe.source}:${recipe.id}`;
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

function saveStorage(
  storageKey: string,
  checkedSteps: boolean[]
): void {
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(checkedSteps)
    );

    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // Cooking progress remains available when browser
    // storage is accessible. Storage errors are ignored.
  }
}

export function useCookingProgress(recipe: Recipe) {
  const storageKey = getStorageKey(recipe);

  const storedValue = useSyncExternalStore(
    subscribe,
    () => readStorage(storageKey),
    () => "[]"
  );

  let savedSteps: boolean[] = [];

  try {
    const parsed: unknown = JSON.parse(storedValue);

    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "boolean")
    ) {
      savedSteps = parsed;
    }
  } catch {
    savedSteps = [];
  }

  const checkedSteps = recipe.instructions.map(
    (_, index) => savedSteps[index] ?? false
  );

  const completedCount = checkedSteps.filter(Boolean).length;
  const totalSteps = recipe.instructions.length;

  function toggleStep(index: number) {
    if (index < 0 || index >= totalSteps) {
      return;
    }

    const updated = checkedSteps.map(
      (checked, stepIndex) =>
        stepIndex === index ? !checked : checked
    );

    saveStorage(storageKey, updated);
  }

  function clearAllSteps() {
    saveStorage(
      storageKey,
      recipe.instructions.map(() => false)
    );
  }

  return {
    checkedSteps,
    completedCount,
    totalSteps,
    toggleStep,
    clearAllSteps,
  };
}
