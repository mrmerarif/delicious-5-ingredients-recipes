
/**
 * Delicious 5 Ingredients Recipes
 * Internationalization configuration
 *
 * Supported website languages:
 * English, Spanish, and Brazilian Portuguese.
 */

export const locales = ["en", "es", "pt-BR"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  "pt-BR": "Português (Brasil)",
};

export const localeLanguageTags: Record<Locale, string> = {
  en: "en",
  es: "es",
  "pt-BR": "pt-BR",
};

export function isValidLocale(
  value: string
): value is Locale {
  return locales.some((locale) => locale === value);
}

export function getValidLocale(value: string): Locale {
  return isValidLocale(value) ? value : defaultLocale;
}

export function getLocalizedPath(
  locale: Locale,
  path = ""
): string {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  if (normalizedPath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}
