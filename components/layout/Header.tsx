
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import LanguageSwitcher from "./LanguageSwitcher";

import type { Locale } from "../../lib/i18n/config";
import type { Dictionary } from "../../lib/i18n/dictionaries";

interface HeaderProps {
  locale: Locale;
  dictionary: Dictionary;
}

export default function Header({
  locale,
  dictionary,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
      label: dictionary.navigation.home,
      href: `/${locale}`,
    },
    {
      label: dictionary.navigation.recipes,
      href: `/${locale}/recipes`,
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

  function isActiveRoute(href: string) {
    if (href === `/${locale}`) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  const inactiveLinkStyle =
    "text-[var(--header-nav-text)] hover:bg-[var(--header-language-active-bg)] hover:text-[var(--header-language-active-text)]";

  const activeLinkStyle =
    "bg-[var(--header-language-active-bg)] text-[var(--header-language-active-text)]";

  return (
    <>
      {/* Language row - scrolls away with the page */}
      <div className="language-row bg-[var(--header-language-bg)] text-[var(--header-language-text)]">
        <div className="site-container flex min-h-11 items-center justify-end py-1">
          <Suspense fallback={null}>
            <LanguageSwitcher
              locale={locale}
              label={dictionary.navigation.language}
            />
          </Suspense>
        </div>
      </div>

      {/* Main header - stays visible while scrolling */}
      <header className="site-header sticky top-0 z-50">

        {/* Gold divider */}
        <div
          aria-hidden="true"
          className="h-1 bg-[var(--header-divider)]"
        />

        {/* Main navigation */}
        <div className="bg-[var(--header-nav-bg)] shadow-md">
          <div className="site-container flex min-h-20 items-center justify-between gap-4 py-3">

            {/* Logo - moved left on desktop only */}
            <Link
              href={`/${locale}`}
              className="flex shrink-0 items-center gap-3 rounded-lg lg:-translate-x-8"
              aria-label={dictionary.brand.name}
              onClick={() => setMenuOpen(false)}
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--header-logo-bg)] text-xl text-[var(--header-logo-text)]"
              >
                🍽
              </span>

              <span className="flex flex-col">
                <span className="text-lg font-bold leading-tight text-[var(--header-nav-text)]">
                  Delicious 5
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--header-nav-hover)]">
                  Ingredients Recipes
                </span>
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav
              className="hidden items-center gap-2 lg:flex"
              aria-label="Main navigation"
            >
              {navigation.map((item) => {
                const isActive = isActiveRoute(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? activeLinkStyle
                        : inactiveLinkStyle
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--header-nav-muted)] text-[var(--header-nav-text)] transition-colors hover:bg-[var(--header-language-active-bg)] lg:hidden"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <span aria-hidden="true" className="text-2xl">
                {menuOpen ? "×" : "☰"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {menuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="border-t border-white/20 bg-[var(--header-nav-bg)] shadow-lg lg:hidden"
          >
            <div className="site-container flex flex-col gap-1 py-3">
              {navigation.map((item) => {
                const isActive = isActiveRoute(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? activeLinkStyle
                        : inactiveLinkStyle
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
