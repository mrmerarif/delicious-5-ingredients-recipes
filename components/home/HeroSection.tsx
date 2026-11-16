
import Image from "next/image";

import IngredientSearch from "./IngredientSearch";

import type { Locale } from "../../lib/i18n/config";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface HeroSectionProps {
  locale: Locale;
  dictionary: Dictionary;
}

export default function HeroSection({
  locale,
  dictionary,
}: HeroSectionProps) {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="overflow-hidden bg-[var(--background)]"
    >
      <div className="site-container grid min-h-[620px] items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
        {/* Hero text */}
        <div className="flex flex-col gap-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--fsm-accent)]">
            {dictionary.hero.eyebrow}
          </p>

          <h1
            id="home-hero-title"
            className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-[3.5rem]"
          >
            {dictionary.hero.title}
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-[var(--text-muted)]">
            {dictionary.hero.description}
          </p>

          <div className="w-full max-w-xl">
            <IngredientSearch
              locale={locale}
              placeholder={dictionary.hero.searchPlaceholder}
              buttonLabel={dictionary.hero.searchButton}
            />
          </div>

          <p className="text-sm text-[var(--text-muted)]">
            {dictionary.brand.tagline}
          </p>
        </div>

        {/* Mediterranean hero image */}
        <div className="relative min-h-[340px] overflow-hidden rounded-[1.5rem] bg-[var(--surface-muted)] shadow-[var(--shadow-card)] sm:min-h-[440px] lg:min-h-[520px]">
          <Image
            src="/images/hero-kitchen.webp"
            alt="Mediterranean-inspired food and fresh ingredients in a warm kitchen setting"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-2 w-full bg-[var(--fsm-accent-2)]"
          />
        </div>
      </div>
    </section>
  );
}
