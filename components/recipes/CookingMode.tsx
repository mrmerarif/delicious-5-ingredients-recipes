
"use client";

import { useSyncExternalStore } from "react";

import { useCookingProgress } from "../../hooks/useCookingProgress";

import type { Recipe } from "../../types/recipe";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface CookingModeProps {
  recipe: Recipe;
  dictionary: Dictionary;
  onClose: () => void;
}

const STEP_EVENT =
  "delicious5:current-cooking-step-updated";

function getStepStorageKey(recipe: Recipe): string {
  return `delicious5:current-cooking-step:${recipe.source}:${recipe.id}`;
}

function subscribeToStep(
  callback: () => void
): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(STEP_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STEP_EVENT, callback);
  };
}

function readCurrentStep(storageKey: string): string {
  try {
    return window.localStorage.getItem(storageKey) ?? "0";
  } catch {
    return "0";
  }
}

function saveCurrentStep(
  storageKey: string,
  step: number
): void {
  try {
    window.localStorage.setItem(
      storageKey,
      String(step)
    );

    window.dispatchEvent(new Event(STEP_EVENT));
  } catch {
    // Browser storage may be unavailable.
  }
}

export default function CookingMode({
  recipe,
  dictionary,
  onClose,
}: CookingModeProps) {
  const storageKey = getStepStorageKey(recipe);

  const storedStep = useSyncExternalStore(
    subscribeToStep,
    () => readCurrentStep(storageKey),
    () => "0"
  );

  const {
    checkedSteps,
    completedCount,
    totalSteps,
    toggleStep,
    clearAllSteps,
  } = useCookingProgress(recipe);

  const parsedStep = Number(storedStep);

  const currentStep =
    Number.isInteger(parsedStep) && parsedStep >= 0
      ? Math.min(
          parsedStep,
          Math.max(totalSteps - 1, 0)
        )
      : 0;

  const isSpanish =
    dictionary.navigation.home === "Inicio";

  const isPortuguese =
    dictionary.navigation.home === "Início";

  const labels = {
    close: isSpanish
      ? "Cerrar"
      : isPortuguese
        ? "Fechar"
        : "Close",

    done: isSpanish
      ? "Hecho"
      : isPortuguese
        ? "Feito"
        : "Done",

    completed: isSpanish
      ? "completados"
      : isPortuguese
        ? "concluídos"
        : "completed",

    startOver: isSpanish
      ? "Empezar de nuevo"
      : isPortuguese
        ? "Recomeçar"
        : "Start Over",

    startOverConfirm: isSpanish
      ? "¿Quieres empezar de nuevo? Se borrarán los pasos completados, pero no los ingredientes seleccionados."
      : isPortuguese
        ? "Deseja recomeçar? As etapas concluídas serão apagadas, mas os ingredientes selecionados serão mantidos."
        : "Start over? Completed cooking steps will be cleared, but your ingredient selections will remain unchanged.",
  };

  const percentage =
    totalSteps > 0
      ? Math.round(
          (completedCount / totalSteps) * 100
        )
      : 0;

  const instruction =
    recipe.instructions[currentStep];

  function goToStep(step: number) {
    if (totalSteps === 0) return;

    const nextStep = Math.max(
      0,
      Math.min(totalSteps - 1, step)
    );

    saveCurrentStep(storageKey, nextStep);
  }

  function startOver() {
    if (typeof window === "undefined") return;

    const confirmed = window.confirm(
      labels.startOverConfirm
    );

    if (!confirmed) return;

    clearAllSteps();
    saveCurrentStep(storageKey, 0);
  }

  function finishCooking() {
    saveCurrentStep(storageKey, 0);
    onClose();
  }

  return (
    <section
      aria-labelledby="cooking-mode-title"
      className="rounded-2xl border border-[var(--surface-muted)] bg-[var(--background)] p-5 shadow-lg sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--fsm-accent)]">
            {recipe.title}
          </p>

          <h2
            id="cooking-mode-title"
            className="mt-2 text-2xl font-bold text-[var(--foreground)]"
          >
            {dictionary.cooking.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
        >
          {labels.close}
        </button>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
          <span>
            {completedCount} / {totalSteps}{" "}
            {labels.completed}
          </span>

          <span className="tabular-nums">
            {percentage}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-label={dictionary.cooking.title}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
          className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"
        >
          <div
            className="h-full rounded-full bg-[var(--fsm-accent)] transition-[width] duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {totalSteps > 0 ? (
        <>
          <div className="mt-8 rounded-xl bg-[var(--surface-muted)] p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--fsm-accent)] font-bold text-white">
                {currentStep + 1}
              </span>

              <span className="text-sm font-semibold text-[var(--foreground)]">
                {dictionary.cooking.step}{" "}
                {currentStep + 1} / {totalSteps}
              </span>
            </div>

            <p className="mt-6 text-base leading-relaxed text-[var(--foreground)]">
              {instruction}
            </p>

            <label className="mt-6 inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-[var(--foreground)]">
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={
                    checkedSteps[currentStep] ?? false
                  }
                  onChange={() =>
                    toggleStep(currentStep)
                  }
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-400 bg-white checked:border-[var(--fsm-accent)] checked:bg-[var(--fsm-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fsm-accent)]"
                />

                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100"
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

              {labels.done}
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={() =>
                goToStep(currentStep - 1)
              }
              className="rounded-lg border border-[var(--surface-muted)] px-4 py-3 font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {dictionary.cooking.previousStep}
            </button>

            {currentStep === totalSteps - 1 ? (
              <button
                type="button"
                onClick={finishCooking}
                className="btn-primary"
              >
                {dictionary.cooking.finish}
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  goToStep(currentStep + 1)
                }
                className="btn-primary"
              >
                {dictionary.cooking.nextStep}
              </button>
            )}
          </div>

          <div className="mt-6 border-t border-[var(--surface-muted)] pt-4">
            <button
              type="button"
              onClick={startOver}
              disabled={
                currentStep === 0 &&
                completedCount === 0
              }
              className="text-sm font-medium text-[var(--fsm-accent)] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              {labels.startOver}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-8 text-[var(--text-muted)]">
          {dictionary.recipes.notAvailable}
        </p>
      )}
    </section>
  );
}
