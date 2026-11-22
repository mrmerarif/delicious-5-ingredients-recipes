
"use client";

import { useEffect, useState } from "react";

import {
  addPlannedMeal,
  getPlannedMeals,
  removePlannedMeal,
  updatePlannedMeal,
  MEAL_PLANNER_UPDATED,
  type MealType,
  type PlannedMeal,
} from "../../lib/meal-planner/storage";

import type { Recipe } from "../../types/recipe";

interface Props {
  recipe: Recipe;
  locale: string;
}

interface SelectedMeal {
  date: string;
  mealType: MealType;
}

interface PlannerDraft {
  isOpen: boolean;
  selectedDate: string;
  selectedMeals: SelectedMeal[];
}

const translations = {
  en: {
    button: "Add to Meal Planner",
    title: "Plan this recipe",
    choose: "Choose a date",
    add: "Add Date",
    selected: "Dates to schedule",
    scheduled: "Already scheduled",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    save: "Save to Meal Planner",
    close: "Close",
    saved: "Meal plan saved successfully!",
    updated: "Meal updated successfully!",
    removed: "Scheduled meal removed.",
    duplicate: "That meal is already scheduled.",
    error: "Unable to save changes.",
    remove: "Remove",
    empty: "No meals scheduled for this recipe yet.",
  },
  es: {
    button: "Agregar al plan de comidas",
    title: "Planificar esta receta",
    choose: "Selecciona una fecha",
    add: "Agregar fecha",
    selected: "Fechas por programar",
    scheduled: "Comidas programadas",
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    snack: "Merienda",
    save: "Guardar en el plan",
    close: "Cerrar",
    saved: "¡Plan de comidas guardado!",
    updated: "¡Comida actualizada!",
    removed: "Comida eliminada del plan.",
    duplicate: "Esta comida ya está programada.",
    error: "No se pudieron guardar los cambios.",
    remove: "Eliminar",
    empty: "Todavía no hay comidas programadas.",
  },
  "pt-BR": {
    button: "Adicionar ao planejamento",
    title: "Planejar esta receita",
    choose: "Escolha uma data",
    add: "Adicionar data",
    selected: "Datas para planejar",
    scheduled: "Refeições planejadas",
    breakfast: "Café da manhã",
    lunch: "Almoço",
    dinner: "Jantar",
    snack: "Lanche",
    save: "Salvar no planejamento",
    close: "Fechar",
    saved: "Planejamento salvo com sucesso!",
    updated: "Refeição atualizada!",
    removed: "Refeição removida do planejamento.",
    duplicate: "Esta refeição já está planejada.",
    error: "Não foi possível salvar as alterações.",
    remove: "Remover",
    empty: "Nenhuma refeição planejada ainda.",
  },
} as const;

function todayLocal(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date: string, locale: string): string {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

const mealTypes: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

export default function AddToMealPlanner({
  recipe,
  locale,
}: Props) {
  const language =
    locale === "es" || locale === "pt-BR"
      ? locale
      : "en";

  const t = translations[language];

  const draftKey =
    `delicious5:planner-draft:${recipe.source}:${recipe.id}`;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMeals, setSelectedMeals] =
    useState<SelectedMeal[]>([]);
  const [savedMeals, setSavedMeals] =
    useState<PlannedMeal[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setSavedMeals(
        getPlannedMeals()
          .filter(
            (meal) =>
              meal.recipeId === recipe.id &&
              meal.source === recipe.source
          )
          .sort((a, b) => a.date.localeCompare(b.date))
      );
    };

    refresh();

    try {
      const raw = localStorage.getItem(draftKey);

      if (raw) {
        const draft = JSON.parse(raw) as PlannerDraft;

        setIsOpen(draft.isOpen === true);

        setSelectedDate(
          typeof draft.selectedDate === "string"
            ? draft.selectedDate
            : todayLocal()
        );

        setSelectedMeals(
          Array.isArray(draft.selectedMeals)
            ? draft.selectedMeals.filter(
                (item) =>
                  typeof item.date === "string" &&
                  mealTypes.includes(item.mealType)
              )
            : []
        );
      } else {
        setSelectedDate(todayLocal());
      }
    } catch {
      setSelectedDate(todayLocal());
    }

    setReady(true);

    window.addEventListener(
      MEAL_PLANNER_UPDATED,
      refresh
    );

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(
        MEAL_PLANNER_UPDATED,
        refresh
      );

      window.removeEventListener("storage", refresh);
    };
  }, [draftKey, recipe.id, recipe.source]);

  useEffect(() => {
    if (!ready) return;

    const draft: PlannerDraft = {
      isOpen,
      selectedDate,
      selectedMeals,
    };

    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify(draft)
      );
    } catch {
      // Storage can be unavailable.
    }
  }, [
    draftKey,
    isOpen,
    selectedDate,
    selectedMeals,
    ready,
  ]);

  function addDate() {
    if (!selectedDate) return;

    setSelectedMeals((current): SelectedMeal[] => {
      if (
        current.some(
          (item) => item.date === selectedDate
        )
      ) {
        return current;
      }

      const newMeal: SelectedMeal = {
        date: selectedDate,
        mealType: "dinner",
      };

      return [...current, newMeal].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    });

    setMessage("");
  }

  function updateDraft(
    date: string,
    mealType: MealType
  ) {
    setSelectedMeals((current) =>
      current.map((item) =>
        item.date === date
          ? { ...item, mealType }
          : item
      )
    );
  }

  function saveMeals() {
    const pending =
      selectedMeals.length > 0
        ? selectedMeals
        : selectedDate
          ? [
              {
                date: selectedDate,
                mealType: "dinner" as MealType,
              },
            ]
          : [];

    if (!pending.length) return;

    try {
      const existing = getPlannedMeals();
      let added = 0;

      for (const item of pending) {
        const duplicate = existing.some(
          (meal) =>
            meal.recipeId === recipe.id &&
            meal.source === recipe.source &&
            meal.date === item.date &&
            meal.mealType === item.mealType
        );

        if (duplicate) continue;

        const saved = addPlannedMeal({
          recipeId: recipe.id,
          source: recipe.source,
          title: recipe.title,
          imageUrl: recipe.imageUrl,
          date: item.date,
          mealType: item.mealType,
        });

        existing.push(saved);
        added++;
      }

      setSelectedMeals([]);
      setSelectedDate("");
      setError(false);
      setMessage(
        added > 0 ? t.saved : t.duplicate
      );
    } catch {
      setError(true);
      setMessage(t.error);
    }
  }

  function changeSavedMeal(
    meal: PlannedMeal,
    mealType: MealType
  ) {
    try {
      updatePlannedMeal(meal.id, { mealType });
      setError(false);
      setMessage(t.updated);
    } catch {
      setError(true);
      setMessage(t.duplicate);
    }
  }

  function deleteSavedMeal(id: string) {
    try {
      removePlannedMeal(id);
      setError(false);
      setMessage(t.removed);
    } catch {
      setError(true);
      setMessage(t.error);
    }
  }

  function mealSelector(
    value: MealType,
    onChange: (value: MealType) => void,
    label: string
  ) {
    return (
      <select
        aria-label={label}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value as MealType
          )
        }
        className="w-32 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs text-[var(--foreground)]"
      >
        {mealTypes.map((type) => (
          <option key={type} value={type}>
            {t[type]}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
          setMessage("");

          if (!selectedDate) {
            setSelectedDate(todayLocal());
          }
        }}
        aria-expanded={isOpen}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--fsm-accent)] px-4 py-2 text-sm font-semibold text-[var(--fsm-accent)] transition-colors hover:bg-[var(--surface-muted)]"
      >
        <span aria-hidden="true">📅</span>
        {t.button}
      </button>

      {isOpen && (
        <div className="relative z-20 mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-lg sm:absolute sm:right-0 sm:w-[430px]">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {t.title}
          </h2>

          <label
            htmlFor="planner-date"
            className="mb-2 mt-4 block text-sm font-medium"
          >
            {t.choose}
          </label>

          <div className="flex gap-2">
            <input
              id="planner-date"
              type="date"
              value={selectedDate}
              min={todayLocal()}
              onChange={(event) =>
                setSelectedDate(
                  event.target.value
                )
              }
              className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />

            <button
              type="button"
              onClick={addDate}
              disabled={!selectedDate}
              className="rounded-lg border border-[var(--fsm-accent)] px-3 py-2 text-sm text-[var(--fsm-accent)] disabled:opacity-50"
            >
              + {t.add}
            </button>
          </div>

          {selectedMeals.length > 0 && (
            <section className="mt-5">
              <h3 className="mb-3 text-sm font-bold">
                {t.selected}
              </h3>

              <div className="space-y-2">
                {selectedMeals.map((item) => (
                  <div
                    key={item.date}
                    className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-2"
                  >
                    <span className="min-w-0 flex-1 text-xs">
                      {formatDate(
                        item.date,
                        language
                      )}
                    </span>

                    {mealSelector(
                      item.mealType,
                      (type) =>
                        updateDraft(
                          item.date,
                          type
                        ),
                      `${t.selected}: ${item.date}`
                    )}

                    <button
                      type="button"
                      aria-label={`${t.remove} ${item.date}`}
                      onClick={() =>
                        setSelectedMeals(
                          (current) =>
                            current.filter(
                              (meal) =>
                                meal.date !==
                                item.date
                            )
                        )
                      }
                      className="px-2 text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveMeals}
              disabled={
                !selectedDate &&
                selectedMeals.length === 0
              }
              className="rounded-full bg-[var(--fsm-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {t.save}
            </button>

            <button
              type="button"
              onClick={() =>
                setIsOpen(false)
              }
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
            >
              {t.close}
            </button>
          </div>

          {message && (
            <p
              role="status"
              className={`mt-3 text-sm font-medium ${
                error
                  ? "text-red-600"
                  : "text-green-700"
              }`}
            >
              {message}
            </p>
          )}

          <section className="mt-5 border-t border-[var(--border)] pt-4">
            <h3 className="mb-3 text-sm font-bold">
              {t.scheduled}
            </h3>

            {savedMeals.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                {t.empty}
              </p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {savedMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-2"
                  >
                    <span className="min-w-0 flex-1 text-xs">
                      {formatDate(
                        meal.date,
                        language
                      )}
                    </span>

                    {mealSelector(
                      meal.mealType,
                      (type) =>
                        changeSavedMeal(
                          meal,
                          type
                        ),
                      `${t.scheduled}: ${meal.date}`
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        deleteSavedMeal(
                          meal.id
                        )
                      }
                      aria-label={`${t.remove} ${meal.date}`}
                      className="px-2 text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
