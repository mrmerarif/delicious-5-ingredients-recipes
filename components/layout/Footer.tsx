
import Link from "next/link";

import type { Locale } from "../../lib/i18n/config";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface FooterProps {
  locale: Locale;
  dictionary: Dictionary;
}

export default function Footer({
  locale,
  dictionary,
}: FooterProps) {
  const copyrightYear = 2026;

  const navigationLinks = [
    {
      label: dictionary.navigation.home,
      href: `/${locale}`,
    },
    {
      label: dictionary.navigation.recipes,
      href: `/${locale}/search`,
    },
    {
      label: dictionary.navigation.pantry,
      href: `/${locale}/pantry`,
    },
    {
      label: dictionary.navigation.mealPlanner,
      href: `/${locale}/meal-planner`,
    },
    {
      label: dictionary.navigation.community,
      href: `/${locale}/community`,
    },
  ];

  const legalLinks = [
    {
      label: dictionary.footer.privacy,
      href: `/${locale}/privacy`,
    },
    {
      label: dictionary.footer.terms,
      href: `/${locale}/terms`,
    },
    {
      label: dictionary.footer.contact,
      href: `/${locale}/contact`,
    },
  ];

  return (
    <footer className="border-t-4 border-[var(--fsm-accent-2)] bg-[var(--fsm-primary)] text-white">
      <div className="site-container grid gap-10 py-12 md:grid-cols-3 lg:gap-16">
        {/* Brand */}
        <div>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-3 rounded-lg"
            aria-label={dictionary.brand.name}
          >
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--fsm-accent)] text-xl"
            >
              🍽
            </span>

            <span className="flex flex-col">
              <span className="text-lg font-bold leading-tight">
                Delicious 5
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fsm-accent-2)]">
                Ingredients Recipes
              </span>
            </span>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/80">
            {dictionary.footer.description}
          </p>

          <p className="mt-4 text-sm text-white/70">
            {dictionary.brand.tagline}
          </p>
        </div>

        {/* Navigation */}
        <nav aria-label={dictionary.footer.quickLinks}>
          <h2 className="mb-4 text-base font-bold text-[var(--fsm-accent-2)]">
            {dictionary.footer.quickLinks}
          </h2>

          <ul className="space-y-3">
            {navigationLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-7 items-center text-sm text-white/80 transition-colors hover:text-[var(--fsm-accent-2)] hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal and contact */}
        <nav aria-label={dictionary.footer.contact}>
          <h2 className="mb-4 text-base font-bold text-[var(--fsm-accent-2)]">
            {dictionary.footer.contact}
          </h2>

          <ul className="space-y-3">
            {legalLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-7 items-center text-sm text-white/80 transition-colors hover:text-[var(--fsm-accent-2)] hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/20">
        <div className="site-container flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-white/70 sm:flex-row sm:text-left">
          <p>
            © {copyrightYear} {dictionary.brand.name}.{" "}
            {dictionary.footer.copyright}
          </p>

          <p>{dictionary.brand.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
