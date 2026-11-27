
import "server-only";

import type {
  TranslationProvider,
  TranslationRequest,
  TranslationResult,
} from "./types";

const GOOGLE_TRANSLATE_ENDPOINT =
  "https://translation.googleapis.com/language/translate/v2";

const MAX_TEXTS_PER_REQUEST = 100;
const MAX_CHARACTERS_PER_REQUEST = 5000;

interface GoogleTranslationResponse {
  data?: {
    translations?: Array<{
      translatedText: string;
    }>;
  };
}

function countCharacters(texts: string[]): number {
  return texts.reduce(
    (total, text) => total + Array.from(text).length,
    0
  );
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export const googleTranslationProvider: TranslationProvider = {
  name: "google",

  async translate(
    request: TranslationRequest
  ): Promise<TranslationResult> {
    const { texts, sourceLocale, targetLocale } = request;

    if (texts.length === 0) {
      return {
        texts: [],
        provider: "google",
      };
    }

    if (texts.length > MAX_TEXTS_PER_REQUEST) {
      throw new Error(
        "Translation request contains too many text segments."
      );
    }

    if (
      countCharacters(texts) >
      MAX_CHARACTERS_PER_REQUEST
    ) {
      throw new Error(
        "Translation request exceeds the character limit."
      );
    }

    if (sourceLocale === targetLocale) {
      return {
        texts: [...texts],
        provider: "google",
      };
    }

    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Google Cloud Translation is not configured."
      );
    }

    const response = await fetch(GOOGLE_TRANSLATE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        q: texts,
        source: sourceLocale,
        target: targetLocale,
        format: "text",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(
        `Google Cloud Translation request failed (${response.status}).`
      );
    }

    const data =
      (await response.json()) as GoogleTranslationResponse;

    const translatedTexts = data.data?.translations?.map(
      (translation) =>
        decodeHtmlEntities(translation.translatedText)
    );

    if (
      !translatedTexts ||
      translatedTexts.length !== texts.length
    ) {
      throw new Error(
        "Google Cloud Translation returned an invalid response."
      );
    }

    return {
      texts: translatedTexts,
      provider: "google",
    };
  },
};
