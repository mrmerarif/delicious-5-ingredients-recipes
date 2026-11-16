
"use client";

import Image from "next/image";
import { useRef } from "react";

import type { Locale } from "../../lib/i18n/config";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface KitchenEssentialsCarouselProps {
  locale: Locale;
  dictionary: Dictionary;
}

interface KitchenEssential {
  id: string;
  image: string;
  names: Record<Locale, string>;
}

const essentials: KitchenEssential[] = [
  {
    id: "cookware",
    image: "/images/essential-cookware.webp",
    names: {
      en: "Quality Cookware",
      es: "Utensilios para cocinar",
      "pt-BR": "Panelas e frigideiras",
    },
  },
  {
    id: "cutting-board",
    image: "/images/essential-cutting-board.webp",
    names: {
      en: "Cutting Boards",
      es: "Tablas para cortar",
      "pt-BR": "Tábuas de corte",
    },
  },
  {
    id: "measuring-cups",
    image: "/images/essential-measuring-cups.webp",
    names: {
      en: "Measuring Cups",
      es: "Tazas medidoras",
      "pt-BR": "Xícaras medidoras",
    },
  },
  {
    id: "food-storage",
    image: "/images/essential-food-storage.webp",
    names: {
      en: "Food Storage",
      es: "Recipientes para alimentos",
      "pt-BR": "Potes para alimentos",
    },
  },
  {
    id: "kitchen-scale",
    image: "/images/essential-kitchen-scale.webp",
    names: {
      en: "Kitchen Scales",
      es: "Básculas de cocina",
      "pt-BR": "Balanças de cozinha",
    },
  },
];

const controls: Record<
  Locale,
  {
    previous: string;
    next: string;
    image: string;
    scrollHint: string;
  }
> = {
  en: {
    previous: "Previous kitchen essentials",
    next: "Next kitchen essentials",
    image: "Kitchen essential",
    scrollHint: "Explore helpful kitchen tools",
  },
  es: {
    previous: "Ver utensilios anteriores",
    next: "Ver siguientes utensilios",
    image: "Utensilio de cocina",
    scrollHint: "Descubre utensilios útiles para tu cocina",
  },
  "pt-BR": {
    previous: "Ver utensílios anteriores",
    next: "Ver próximos utensílios",
    image: "Utensílio de cozinha",
    scrollHint: "Explore utensílios úteis para sua cozinha",
  },
};

export default function KitchenEssentialsCarousel({
  locale,
  dictionary,
}: KitchenEssentialsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  function scrollCarousel(direction: -1 | 1) {
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    const firstCard =
      container.querySelector<HTMLElement>(
        "[data-essential-card]"
      );

    const distance = firstCard
      ? firstCard.getBoundingClientRect().width + 16
      : 260;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    container.scrollBy({
      left: direction * distance,
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }

  return (
    <section
      id="kitchen-essentials"
      aria-labelledby="kitchen-essentials-title"
      className="border-b border-[var(--border-color)] bg-[var(--surface-muted)] py-6 sm:py-8"
    >
      <div className="site-container">
        {/* Centered section heading */}
        <div className="mb-6 text-center">
          <h2
            id="kitchen-essentials-title"
            className="text-xl font-bold text-[var(--foreground)] sm:text-2xl"
          >
            {dictionary.affiliate.title}
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            {dictionary.affiliate.description}
          </p>
        </div>

        {/* Carousel with vertically centered arrows */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            aria-label={controls[locale].previous}
            aria-controls="kitchen-essentials-list"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--fsm-accent)] text-white transition-colors hover:bg-[var(--fsm-primary)] focus-visible:outline-offset-2"
          >
            <span aria-hidden="true" className="text-xl">
              ‹
            </span>
          </button>

          <div
            id="kitchen-essentials-list"
            ref={carouselRef}
            role="region"
            aria-roledescription="carousel"
            aria-label={dictionary.affiliate.title}
            tabIndex={0}
            className="flex min-w-0 flex-1 snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
          >
            {essentials.map((item) => (
              <article
                key={item.id}
                data-essential-card
                className="w-[72%] shrink-0 snap-start overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--surface)] shadow-sm sm:w-[42%] lg:w-[30%] xl:w-[23%]"
              >
                <div className="relative h-28 overflow-hidden bg-[var(--surface)] sm:h-32">
                  <Image
                    src={item.image}
                    alt={`${controls[locale].image}: ${item.names[locale]}`}
                    fill
                    sizes="(max-width: 640px) 72vw, (max-width: 1024px) 42vw, 25vw"
                    className="object-contain p-2"
                  />
                </div>

                <div className="border-t border-[var(--border-color)] px-3 py-3">
                  <h3 className="text-center text-sm font-semibold text-[var(--foreground)]">
                    {item.names[locale]}
                  </h3>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            aria-label={controls[locale].next}
            aria-controls="kitchen-essentials-list"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--fsm-accent)] text-white transition-colors hover:bg-[var(--fsm-primary)] focus-visible:outline-offset-2"
          >
            <span aria-hidden="true" className="text-xl">
              ›
            </span>
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
          {controls[locale].scrollHint}
        </p>
      </div>
    </section>
  );
}
