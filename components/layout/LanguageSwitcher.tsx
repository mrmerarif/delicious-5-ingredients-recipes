
"use client";

import Link from "next/link";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import {
  isValidLocale,
  type Locale,
} from "../../lib/i18n/config";

interface LanguageSwitcherProps {
  locale: Locale;
  label: string;
}

const languages = [
  {
    code: "en",
    shortName: "EN",
    name: "English",
  },
  {
    code: "es",
    shortName: "ES",
    name: "Español",
  },
  {
    code: "pt-BR",
    shortName: "PT",
    name: "Português (Brasil)",
  },
] as const;

export default function LanguageSwitcher({
  locale,
  label,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function getLanguagePath(nextLocale: Locale) {
    const segments = pathname
      .split("/")
      .filter(Boolean);

    if (
      segments.length > 0 &&
      isValidLocale(segments[0])
    ) {
      segments[0] = nextLocale;
    } else {
      segments.unshift(nextLocale);
    }

    const path = `/${segments.join("/")}`;
    const query = searchParams.toString();

    return query
      ? `${path}?${query}`
      : path;
  }

  return (
    <nav
      aria-label={label}
      className="flex items-center gap-1"
    >
      <span
        aria-hidden="true"
        className="mr-2 text-base text-[var(--header-language-text)]"
      >
        🌐
      </span>

      {languages.map((language) => {
        const isActive = language.code === locale;

        return (
          <Link
            key={language.code}
            href={getLanguagePath(language.code)}
            hrefLang={language.code}
            lang={language.code}
            aria-label={`Switch to ${language.name}`}
            aria-current={isActive ? "page" : undefined}
            title={language.name}
            className={`inline-flex min-h-10 min-w-11 items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-200 ${
              isActive
                ? "bg-[var(--header-language-active-bg)] text-[var(--header-language-active-text)]"
                : "text-[var(--header-language-text)] hover:bg-[var(--header-language-active-bg)] hover:text-[var(--header-language-active-text)]"
            }`}
          >
            {language.shortName}
          </Link>
        );
      })}
    </nav>
  );
}
