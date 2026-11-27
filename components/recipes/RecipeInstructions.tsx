
"use client";

import { useCookingProgress } from "../../hooks/useCookingProgress";

import type { Recipe } from "../../types/recipe";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface RecipeInstructionsProps {
  recipe: Recipe;
  dictionary: Dictionary;
  onStartCooking: () => void;
}

export default function RecipeInstructions({
  recipe,
  dictionary,
  onStartCooking,
}: RecipeInstructionsProps) {
  const {
    checkedSteps,
    completedCount,
    totalSteps,
    toggleStep,
    clearAllSteps,
  } = useCookingProgress(recipe);

  const language = dictionary.navigation.home;

  const isSpanish = language === "Inicio";
  const isPortuguese = language === "Início";

  const doneLabel = isSpanish
    ? "Hecho"
    : isPortuguese
      ? "Feito"
      : "Done";

  const progressLabel = isSpanish
    ? `${completedCount} de ${totalSteps} pasos completados`
    : isPortuguese
      ? `${completedCount} de ${totalSteps} etapas concluídas`
      : `${completedCount} of ${totalSteps} steps completed`;

  const clearLabel = isSpanish
    ? "Borrar todo"
    : isPortuguese
      ? "Limpar tudo"
      : "Clear All";

  return (
    <section aria-labelledby="recipe-instructions-title">
      <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <h2
          id="recipe-instructions-title"
          className="min-w-0 text-lg font-bold text-[var(--foreground)] sm:text-2xl"
        >
          {dictionary.recipes.instructions}
        </h2>

        <button
          type="button"
          onClick={onStartCooking}
          disabled={totalSteps === 0}
          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--fsm-accent)] px-2.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fsm-accent)] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 shrink-0"
          >
            <path
              d="M7 14a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 7a4 4 0 0 1 0 8H7Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 14v4h8v-4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {dictionary.recipes.startCooking}
        </button>

        <div className="flex items-center justify-end gap-1.5">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 shrink-0 text-[var(--fsm-accent)]"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="m8 12 2.5 2.5L16 9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span className="text-xs font-semibold text-[var(--foreground)]">
            {doneLabel}
          </span>
        </div>
      </div>

      <ol className="space-y-5">
        {recipe.instructions.map((instruction, index) => (
          <li
            key={index}
            className="flex items-start gap-4 rounded-xl bg-[var(--surface-muted)] p-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--fsm-accent)] font-bold text-white">
              {index + 1}
            </span>

            <p className="min-w-0 flex-1 leading-relaxed text-[var(--foreground)]">
              {instruction}
            </p>

            <span className="relative mt-2 flex h-4 w-4 shrink-0 items-center justify-center">
              <input
                type="checkbox"
                checked={checkedSteps[index] ?? false}
                onChange={() => toggleStep(index)}
                aria-label={`${doneLabel}: ${index + 1}`}
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
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-sm text-[var(--text-muted)]"
          aria-live="polite"
        >
          {progressLabel}
        </p>

        <button
          type="button"
          onClick={clearAllSteps}
          disabled={completedCount === 0}
          className="text-sm font-medium text-[var(--fsm-accent)] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
        >
          {clearLabel}
        </button>
      </div>
    </section>
  );
}
