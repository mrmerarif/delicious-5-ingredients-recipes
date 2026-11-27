
"use client";

/**
 * Delicious 5 Ingredients Recipes
 * Reusable responsive recipe carousel.
 *
 * Supports manual navigation, multilingual labels,
 * accessible controls, and saved carousel position.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import RecipeCard from "./RecipeCard";

import type { Recipe } from "../../types/recipe";
import type { Locale } from "../../lib/i18n/config";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface RecipeCarouselProps {
  recipes: Recipe[];
  locale: Locale;
  dictionary: Dictionary;
  title: string;
  description?: string;
  storageKey: string;
}

export default function RecipeCarousel({
  recipes,
  locale,
  dictionary,
  title,
  description,
  storageKey,
}: RecipeCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const headingId = useId();
  const carouselId = useId();

  const [canScrollPrevious, setCanScrollPrevious] =
    useState(false);

  const [canScrollNext, setCanScrollNext] =
    useState(false);

  const updateNavigation = useCallback(() => {
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    const maxScroll =
      container.scrollWidth - container.clientWidth;

    setCanScrollPrevious(
      container.scrollLeft > 2
    );

    setCanScrollNext(
      container.scrollLeft < maxScroll - 2
    );
  }, []);

  const getCards = useCallback(() => {
    return Array.from(
      carouselRef.current?.querySelectorAll<HTMLElement>(
        "[data-carousel-card]"
      ) ?? []
    );
  }, []);

  const getActiveIndex = useCallback(() => {
    const container = carouselRef.current;
    const cards = getCards();

    if (!container || !cards.length) {
      return 0;
    }

    const firstOffset = cards[0].offsetLeft;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const position =
        card.offsetLeft - firstOffset;

      const distance = Math.abs(
        position - container.scrollLeft
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }, [getCards]);

  const scrollToCard = useCallback(
    (
      index: number,
      behavior: ScrollBehavior = "auto"
    ) => {
      const container = carouselRef.current;
      const cards = getCards();

      if (!container || !cards.length) {
        return;
      }

      const safeIndex = Math.max(
        0,
        Math.min(index, cards.length - 1)
      );

      container.scrollTo({
        left:
          cards[safeIndex].offsetLeft -
          cards[0].offsetLeft,
        behavior,
      });
    },
    [getCards]
  );

  const savePosition = useCallback(() => {
    try {
      const index = getActiveIndex();
      const recipe = recipes[index];

      if (recipe) {
        localStorage.setItem(
          storageKey,
          recipe.id
        );
      }
    } catch {
      // Carousel remains usable without storage.
    }
  }, [getActiveIndex, recipes, storageKey]);

  useEffect(() => {
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    let savedIndex = 0;

    try {
      const savedRecipeId =
        localStorage.getItem(storageKey);

      const index = recipes.findIndex(
        (recipe) => recipe.id === savedRecipeId
      );

      if (index >= 0) {
        savedIndex = index;
      }
    } catch {
      // Start from the first recipe.
    }

    const frame = requestAnimationFrame(() => {
      scrollToCard(savedIndex);
      updateNavigation();
    });

    function handleScroll() {
      updateNavigation();
      savePosition();
    }

    container.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    const resizeObserver = new ResizeObserver(
      updateNavigation
    );

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frame);

      container.removeEventListener(
        "scroll",
        handleScroll
      );

      resizeObserver.disconnect();
    };
  }, [
    recipes,
    storageKey,
    scrollToCard,
    updateNavigation,
    savePosition,
  ]);

  function navigate(direction: -1 | 1) {
    const currentIndex = getActiveIndex();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    scrollToCard(
      currentIndex + direction,
      reducedMotion ? "auto" : "smooth"
    );
  }

  if (!recipes.length) {
    return null;
  }

  const arrowClass =
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--fsm-accent)] text-white transition-colors hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fsm-accent)] disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none";

  return (
    <section
      className="mt-12 border-t border-[var(--surface-muted)] pt-10 lg:mt-16"
      aria-labelledby={headingId}
    >
      {/* Section heading */}
      <div className="mb-6">
        <h2
          id={headingId}
          className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl"
        >
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>

      {/* Centered carousel navigation */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* Previous arrow */}
        <button
          type="button"
          className={arrowClass}
          aria-label={
            dictionary.recipes.previousRecipes
          }
          aria-controls={carouselId}
          disabled={!canScrollPrevious}
          onClick={() => navigate(-1)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Recipe cards */}
        <div
          id={carouselId}
          ref={carouselRef}
          className="relative flex min-w-0 flex-1 snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-4"
        >
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              data-carousel-card
              className="min-w-0 shrink-0 basis-full snap-start sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)] xl:basis-[calc((100%-3rem)/4)]"
            >
              <RecipeCard
                recipe={recipe}
                locale={locale}
                dictionary={dictionary}
              />
            </div>
          ))}
        </div>

        {/* Next arrow */}
        <button
          type="button"
          className={arrowClass}
          aria-label={
            dictionary.recipes.nextRecipes
          }
          aria-controls={carouselId}
          disabled={!canScrollNext}
          onClick={() => navigate(1)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

      </div>
    </section>
  );
}
