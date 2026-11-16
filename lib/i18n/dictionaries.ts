
/**
 * Delicious 5 Ingredients Recipes
 * Translation dictionary loader.
 *
 * Loads the correct language dictionary for
 * English, Spanish, or Brazilian Portuguese.
 */

import "server-only";

import type { Locale } from "./config";
import { defaultLocale } from "./config";

import en from "../../messages/en.json";

export type Dictionary = typeof en;

const dictionaries: Record<
  Locale,
  () => Promise<Dictionary>
> = {
  en: () =>
    import("../../messages/en.json").then(
      (module) => module.default
    ),

  es: () =>
    import("../../messages/es.json").then(
      (module) => module.default
    ),

  "pt-BR": () =>
    import("../../messages/pt-BR.json").then(
      (module) => module.default
    ),
};

export async function getDictionary(
  locale: Locale = defaultLocale
): Promise<Dictionary> {
  return dictionaries[locale]();
}
