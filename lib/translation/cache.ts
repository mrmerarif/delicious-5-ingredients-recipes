
/**
 * Delicious 5 Ingredients Recipes
 * Supabase translation cache.
 *
 * Stores and retrieves translated recipes without
 * modifying the original recipe content.
 */

import "server-only";

import { getSupabase } from "../supabase/server";

import type { Locale } from "../i18n/config";
import type { Recipe } from "../../types/recipe";

import type {
  TranslationMethod,
  TranslationReviewStatus,
} from "./types";

interface CachedTranslation {
  provider: string;
  recipe_id: string;
  locale: Locale;
  title: string;
  description: string | null;
  ingredients: Recipe["ingredients"];
  instructions: string[];
  translation_method: TranslationMethod;
  review_status: TranslationReviewStatus;
  source_hash: string;
}

export interface SaveTranslationInput {
  recipe: Recipe;
  locale: Locale;
  sourceHash: string;
  method?: TranslationMethod;
}

export async function getCachedTranslation(
  recipe: Recipe,
  locale: Locale,
  sourceHash: string
): Promise<Recipe | null> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("recipe_translations")
      .select(
        "provider, recipe_id, locale, title, description, ingredients, instructions, translation_method, review_status, source_hash"
      )
      .eq("provider", recipe.source)
      .eq("recipe_id", recipe.id)
      .eq("locale", locale)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const cached = data as CachedTranslation;

    if (cached.review_status === "rejected") {
      return null;
    }

    if (cached.source_hash !== sourceHash) {
      return null;
    }

    return {
      ...recipe,
      title: cached.title,
      description: cached.description ?? undefined,
      ingredients: cached.ingredients,
      instructions: cached.instructions,
      imageAlt: cached.title,
    };
  } catch (error) {
    console.error(
      "Unable to retrieve cached translation:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return null;
  }
}

export async function saveTranslation({
  recipe,
  locale,
  sourceHash,
  method = "automatic",
}: SaveTranslationInput): Promise<boolean> {
  try {
    const supabase = getSupabase();

    // Register the recipe in Samuel's catalog.
    const { error: catalogError } = await supabase
      .from("recipe_catalog")
      .upsert(
        {
          provider: recipe.source,
          recipe_id: recipe.id,
        },
        {
          onConflict: "provider,recipe_id",
          ignoreDuplicates: true,
        }
      );

    if (catalogError) {
      console.error(
        "Unable to register recipe for translation."
      );
      return false;
    }

    // Never overwrite an existing translation here.
    // This protects manually approved content.
    const { error } = await supabase
      .from("recipe_translations")
      .insert({
        provider: recipe.source,
        recipe_id: recipe.id,
        locale,
        title: recipe.title,
        description: recipe.description ?? null,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        translation_method: method,
        review_status: "pending",
        source_hash: sourceHash,
      });

    if (error) {
      // PostgreSQL 23505 means a translation already exists.
      // We leave it unchanged instead of overwriting it.
      if (error.code === "23505") {
        return false;
      }

      console.error(
        "Unable to save recipe translation:",
        error.message
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Unable to save recipe translation:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return false;
  }
}
