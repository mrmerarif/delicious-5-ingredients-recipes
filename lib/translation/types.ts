
/**
 * Delicious 5 Ingredients Recipes
 * Shared translation-provider contracts.
 *
 * Keeps the translation engine replaceable without
 * changing the recipe pages or Supabase schema.
 */

import type { Locale } from "../i18n/config";

export type TranslationProviderName =
  | "google"
  | "libretranslate";

export type TranslationReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

export type TranslationMethod =
  | "automatic"
  | "manual";

export interface TranslationRequest {
  texts: string[];
  sourceLocale: Locale;
  targetLocale: Locale;
}

export interface TranslationResult {
  texts: string[];
  provider: TranslationProviderName;
}

export interface TranslationProvider {
  readonly name: TranslationProviderName;

  translate(
    request: TranslationRequest
  ): Promise<TranslationResult>;
}

export interface TranslationMetadata {
  method: TranslationMethod;
  reviewStatus: TranslationReviewStatus;
  sourceHash: string;
}
