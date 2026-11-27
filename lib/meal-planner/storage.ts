
export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack";

export interface PlannedMeal {
  id: string;
  recipeId: string;
  source?: string;
  title: string;
  imageUrl?: string;
  date: string;
  mealType: MealType;
  addedAt: string;
}

export type NewPlannedMeal = Omit<
  PlannedMeal,
  "id" | "addedAt"
>;

const STORAGE_KEY = "delicious5:meal-planner:v1";

export const MEAL_PLANNER_UPDATED =
  "delicious5:meal-planner-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifyMealPlannerUpdated(): void {
  if (!isBrowser()) return;

  window.dispatchEvent(
    new Event(MEAL_PLANNER_UPDATED)
  );
}

function isMealType(value: unknown): value is MealType {
  return (
    value === "breakfast" ||
    value === "lunch" ||
    value === "dinner" ||
    value === "snack"
  );
}

export function getPlannedMeals(): PlannedMeal[] {
  if (!isBrowser()) return [];

  try {
    const stored = window.localStorage.getItem(
      STORAGE_KEY
    );

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is PlannedMeal =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.recipeId === "string" &&
        typeof item.title === "string" &&
        typeof item.date === "string" &&
        isMealType(item.mealType)
    );
  } catch (error) {
    console.error(
      "Unable to read saved meal plans:",
      error
    );

    return [];
  }
}

function writeMeals(meals: PlannedMeal[]): void {
  if (!isBrowser()) {
    throw new Error(
      "Meal Planner storage is only available in the browser."
    );
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(meals)
  );

  notifyMealPlannerUpdated();
}

export function addPlannedMeal(
  meal: NewPlannedMeal
): PlannedMeal {
  const plannedMeal: PlannedMeal = {
    ...meal,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
  };

  writeMeals([
    ...getPlannedMeals(),
    plannedMeal,
  ]);

  return plannedMeal;
}

export function updatePlannedMeal(
  id: string,
  changes: Partial<
    Pick<PlannedMeal, "date" | "mealType">
  >
): PlannedMeal | null {
  const meals = getPlannedMeals();
  const existing = meals.find(
    (meal) => meal.id === id
  );

  if (!existing) return null;

  const updated: PlannedMeal = {
    ...existing,
    ...changes,
  };

  const duplicate = meals.some(
    (meal) =>
      meal.id !== id &&
      meal.recipeId === updated.recipeId &&
      meal.source === updated.source &&
      meal.date === updated.date &&
      meal.mealType === updated.mealType
  );

  if (duplicate) {
    throw new Error(
      "This recipe is already scheduled for that date and meal."
    );
  }

  writeMeals(
    meals.map((meal) =>
      meal.id === id ? updated : meal
    )
  );

  return updated;
}

export function removePlannedMeal(
  id: string
): void {
  if (!isBrowser()) return;

  writeMeals(
    getPlannedMeals().filter(
      (meal) => meal.id !== id
    )
  );
}

export function getMealsForDate(
  date: string
): PlannedMeal[] {
  return getPlannedMeals().filter(
    (meal) => meal.date === date
  );
}

export function getMealsForRecipe(
  recipeId: string
): PlannedMeal[] {
  return getPlannedMeals().filter(
    (meal) => meal.recipeId === recipeId
  );
}
