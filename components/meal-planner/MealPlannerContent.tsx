"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getPlannedMeals,
  removePlannedMeal,
  updatePlannedMeal,
  MEAL_PLANNER_UPDATED,
  type MealType,
  type PlannedMeal,
} from "../../lib/meal-planner/storage";

interface Props {
  locale: string;
}

const translations = {
  en: {
    eyebrow: "YOUR WEEKLY MENU",
    title: "My Meal Planner",
    description: "Keep your favorite recipes organized and make every meal easier to plan.",
    total: "scheduled meals",
    days: "planned days",
    browse: "Explore Recipes",
    emptyTitle: "Your meal planner is ready!",
    empty: "Find a recipe you love and add it to your meal planner to get started.",
    date: "Date",
    meal: "Meal",
    remove: "Remove",
    error: "This recipe is already scheduled for that date and meal.",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    view: "View Recipe",
    upcoming: "Your Scheduled Recipes",
    tips: "Kitchen Tips",
    tipLabel: "Did you know?",
    tip: "In many baking recipes, unsweetened soy milk can replace dairy milk in a 1:1 ratio. Results may vary by recipe.",
    tipNote: "Always check ingredients for allergies and dietary needs.",
    essentials: "Kitchen Essentials",
    essentialsDescription: "Helpful kitchen tools and ingredients to make cooking easier. Product recommendations are coming soon.",
    comingSoon: "Coming Soon",
    featured: "Featured Kitchen Essential",
    featuredName: "Food Storage",
    featuredDescription: "Keep prepared meals and leftovers organized in suitable food storage containers.",
  },
  es: {
    eyebrow: "TU MENÚ SEMANAL",
    title: "Mi plan de comidas",
    description: "Organiza tus recetas favoritas y facilita la planificación de tus comidas.",
    total: "comidas programadas",
    days: "días planificados",
    browse: "Explorar recetas",
    emptyTitle: "¡Tu plan de comidas está listo!",
    empty: "Encuentra una receta que te guste y agrégala a tu plan para comenzar.",
    date: "Fecha",
    meal: "Comida",
    remove: "Eliminar",
    error: "Esta receta ya está programada para esa fecha y comida.",
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    snack: "Merienda",
    view: "Ver receta",
    upcoming: "Tus recetas programadas",
    tips: "Consejos de cocina",
    tipLabel: "¿Sabías que...?",
    tip: "En muchas recetas de repostería, la bebida de soya sin azúcar puede sustituir la leche en proporción 1:1. El resultado depende de la receta.",
    tipNote: "Revisa siempre los ingredientes por posibles alergias y necesidades alimentarias.",
    essentials: "Esenciales de cocina",
    essentialsDescription: "Herramientas e ingredientes útiles para cocinar más fácilmente. Próximamente tendremos recomendaciones de productos.",
    comingSoon: "Próximamente",
    featured: "Utensilio de cocina destacado",
    featuredName: "Recipientes para alimentos",
    featuredDescription: "Organiza tus comidas preparadas y sobras en recipientes adecuados.",
  },
  "pt-BR": {
    eyebrow: "SEU CARDÁPIO SEMANAL",
    title: "Meu planejamento de refeições",
    description: "Organize suas receitas favoritas e facilite o planejamento das refeições.",
    total: "refeições planejadas",
    days: "dias planejados",
    browse: "Explorar receitas",
    emptyTitle: "Seu planejamento está pronto!",
    empty: "Encontre uma receita de que você goste e adicione-a ao seu planejamento.",
    date: "Data",
    meal: "Refeição",
    remove: "Remover",
    error: "Esta receita já está planejada para essa data e refeição.",
    breakfast: "Café da manhã",
    lunch: "Almoço",
    dinner: "Jantar",
    snack: "Lanche",
    view: "Ver receita",
    upcoming: "Suas receitas planejadas",
    tips: "Dicas de cozinha",
    tipLabel: "Você sabia?",
    tip: "Em muitas receitas de bolos, a bebida de soja sem açúcar pode substituir o leite na proporção de 1:1. O resultado varia conforme a receita.",
    tipNote: "Sempre confira os ingredientes quanto a alergias e necessidades alimentares.",
    essentials: "Essenciais de cozinha",
    essentialsDescription: "Utensílios e ingredientes úteis para facilitar o preparo das refeições. Recomendações de produtos em breve.",
    comingSoon: "Em breve",
    featured: "Utensílio de cozinha em destaque",
    featuredName: "Potes para alimentos",
    featuredDescription: "Organize suas refeições preparadas e sobras em recipientes adequados.",
  },
} as const;

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function formatDate(date: string, locale: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function MealPlannerContent({ locale }: Props) {
  const language = locale === "es" || locale === "pt-BR" ? locale : "en";
  const t = translations[language];
  const [meals, setMeals] = useState<PlannedMeal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => {
      setMeals(
        getPlannedMeals().sort(
          (a, b) =>
            a.date.localeCompare(b.date) ||
            mealTypes.indexOf(a.mealType) - mealTypes.indexOf(b.mealType)
        )
      );
      setLoaded(true);
    };
    refresh();
    window.addEventListener(MEAL_PLANNER_UPDATED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(MEAL_PLANNER_UPDATED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function editMeal(id: string, changes: Partial<Pick<PlannedMeal, "date" | "mealType">>) {
    try {
      updatePlannedMeal(id, changes);
      setError("");
    } catch {
      setError(t.error);
    }
  }

  function removeMeal(id: string) {
    removePlannedMeal(id);
    setError("");
  }

  const dates = [...new Set(meals.map((meal) => meal.date))];

  return (
    <div className="site-container py-8 lg:py-10">
      <section className="mb-7 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-5 sm:px-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--fsm-accent)]">
          {t.eyebrow}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4 lg:flex-nowrap">
          <div className="min-w-0 lg:max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t.description}</p>
          </div>

          {loaded && (
            <div className="flex flex-wrap items-center justify-center gap-2" aria-label={`${meals.length} ${t.total}; ${dates.length} ${t.days}`}>
              <span className="whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-medium text-[var(--foreground)]">
                <strong className="text-[var(--fsm-accent)]">{meals.length}</strong> {t.total}
              </span>
              <span className="whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-medium text-[var(--foreground)]">
                <strong className="text-[var(--fsm-accent)]">{dates.length}</strong> {t.days}
              </span>
            </div>
          )}

          <Link
            href={`/${language}/search`}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--fsm-accent)] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <span aria-hidden="true">⌕</span>
            {t.browse}
          </Link>
        </div>
      </section>

      {error && (
        <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {loaded && meals.length === 0 && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-6 py-10 text-center">
          <div aria-hidden="true" className="mb-3 text-4xl">🍽️</div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">{t.emptyTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--text-muted)]">{t.empty}</p>
          <Link href={`/${language}/search`} className="mt-5 inline-flex rounded-full border border-[var(--fsm-accent)] px-5 py-3 text-sm font-semibold text-[var(--fsm-accent)] hover:bg-[var(--surface-muted)]">
            {t.browse}
          </Link>
        </section>
      )}

      {loaded && meals.length > 0 && (
        <section aria-labelledby="scheduled-recipes-heading">
          <h2 id="scheduled-recipes-heading" className="mb-5 text-xl font-bold text-[var(--foreground)]">
            {t.upcoming}
          </h2>
          <div className="space-y-6">
            {dates.map((date) => (
              <section key={date}>
                <h3 className="mb-3 border-b border-[var(--border)] pb-2 text-sm font-bold capitalize text-[var(--foreground)] lg:w-[calc(50%_-_0.75rem)]">
                  {formatDate(date, language)}
                </h3>
                <div className="grid gap-3">
                  {meals.filter((meal) => meal.date === date).map((meal) => {
                    const index = meals.findIndex((item) => item.id === meal.id);
                    return (
                      <div key={meal.id} className="grid items-stretch gap-3 lg:grid-cols-2 lg:gap-6">
                      <article className="h-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex min-w-0 items-center gap-3">
                          {meal.imageUrl && (
                            <Link href={`/${language}/recipes/${encodeURIComponent(meal.recipeId)}`} aria-label={`${t.view}: ${meal.title}`} className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fsm-accent)]">
                              {/* External recipe images are provided by the recipe data source. */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={meal.imageUrl} alt={meal.title} loading="lazy" className="h-20 w-20 rounded-lg object-cover sm:h-24 sm:w-24" />
                            </Link>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="break-words text-sm font-bold text-[var(--foreground)] sm:text-base">{meal.title}</h4>
                            <Link href={`/${language}/recipes/${encodeURIComponent(meal.recipeId)}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--fsm-accent)] hover:underline">
                              {t.view} <span aria-hidden="true">→</span>
                            </Link>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-[var(--border)] pt-3">
                          <div className="min-w-0">
                            <label htmlFor={`date-${meal.id}`} className="mb-1 block text-xs font-medium text-[var(--text-muted)]">{t.date}</label>
                            <input id={`date-${meal.id}`} type="date" value={meal.date} onChange={(event) => editMeal(meal.id, { date: event.target.value })} className="max-w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs text-[var(--foreground)]" />
                          </div>
                          <div>
                            <label htmlFor={`type-${meal.id}`} className="mb-1 block text-xs font-medium text-[var(--text-muted)]">{t.meal}</label>
                            <select id={`type-${meal.id}`} value={meal.mealType} onChange={(event) => editMeal(meal.id, { mealType: event.target.value as MealType })} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs text-[var(--foreground)]">
                              {mealTypes.map((type) => <option key={type} value={type}>{t[type]}</option>)}
                            </select>
                          </div>
                          <button type="button" onClick={() => removeMeal(meal.id)} className="min-h-9 rounded-full border border-red-500 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50">
                            {t.remove}
                          </button>
                        </div>
                      </article>
                        {index === 0 && (
            <section className="flex h-full min-w-0 flex-col rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 shadow-sm" aria-labelledby="kitchen-tips-heading">
            <h2 id="kitchen-tips-heading" className="text-lg font-bold text-[var(--foreground)]">💡 {t.tips}</h2>
            <p className="mt-3 text-sm font-semibold text-[var(--fsm-accent)]">{t.tipLabel}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{t.tip}</p>
            <p className="mt-auto border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">{t.tipNote}</p>
            </section>
                        )}
                        {index === 1 && (
            <section className="flex h-full min-w-0 flex-col rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 shadow-sm" aria-labelledby="featured-essential-heading">
              <h2 id="featured-essential-heading" className="text-lg font-bold text-[var(--foreground)]">{t.featured}</h2>
              <div className="mt-3 flex flex-1 items-center gap-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-muted)]">
                  <Image src="/images/essential-food-storage.webp" alt={t.featuredName} fill sizes="96px" className="object-contain p-1" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">{t.featuredName}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{t.featuredDescription}</p>
                </div>
              </div>
            </section>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
            {meals.length === 1 && (
              <div className="grid gap-3 lg:grid-cols-2 lg:gap-6">
                <div className="hidden lg:block" aria-hidden="true" />
            <section className="flex h-full min-w-0 flex-col rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 shadow-sm" aria-labelledby="featured-essential-heading">
              <h2 id="featured-essential-heading" className="text-lg font-bold text-[var(--foreground)]">{t.featured}</h2>
              <div className="mt-3 flex flex-1 items-center gap-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-muted)]">
                  <Image src="/images/essential-food-storage.webp" alt={t.featuredName} fill sizes="96px" className="object-contain p-1" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">{t.featuredName}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{t.featuredDescription}</p>
                </div>
              </div>
            </section>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mt-12 border-t border-[var(--border)] pt-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">{t.essentials}</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">{t.essentialsDescription}</p>
          </div>
          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">{t.comingSoon}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {["🍳", "🥣", "🔪", "🛒"].map((symbol, index) => (
            <div key={index} aria-hidden="true" className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] text-4xl">
              {symbol}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
