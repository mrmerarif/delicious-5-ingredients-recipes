/**
 * Delicious 5 Ingredients Recipes
 * Suggested Recipes API endpoint.
 *
 * Returns related recipes based on shared
 * ingredients and recipe categories.
 */

import { NextRequest, NextResponse } from "next/server";

import { getSuggestedRecipes } from "@/lib/recipes/getSuggestedRecipes";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const recipeId = searchParams.get("id")?.trim();

  const requestedLimit = searchParams.get("limit");

  const limit =
    requestedLimit === null
      ? 8
      : Number(requestedLimit);

  if (!recipeId || !/^\d{1,20}$/.test(recipeId)) {
    return NextResponse.json(
      {
        error: "A valid recipe ID is required.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 8
  ) {
    return NextResponse.json(
      {
        error: "The limit must be between 1 and 8.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const recipes = await getSuggestedRecipes(
      recipeId,
      limit
    );

    return NextResponse.json(
      {
        recipeId,
        totalResults: recipes.length,
        recipes,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, max-age=300, s-maxage=3600",
        },
      }
    );
  } catch (error) {
    console.error(
      "Suggested recipes request failed:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return NextResponse.json(
      {
        error: "Unable to retrieve suggested recipes.",
      },
      {
        status: 500,
      }
    );
  }
}