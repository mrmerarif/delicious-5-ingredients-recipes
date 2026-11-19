// GET /api/search?ingredient=chicken
// Returns recipes that contain the given ingredient.

import { NextRequest, NextResponse } from "next/server";
import { searchByIngredient } from "@/lib/recipes/searchByIngredient";

const MAX_LENGTH = 50;

export async function GET(req: NextRequest) {
  const ingredient = req.nextUrl.searchParams.get("ingredient")?.trim();

  if (!ingredient) {
    return NextResponse.json(
      { error: 'Missing "ingredient" query parameter' },
      { status: 400 }
    );
  }

  if (ingredient.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `Ingredient must be ${MAX_LENGTH} characters or fewer` },
      { status: 400 }
    );
  }

  try {
    const results = await searchByIngredient(ingredient);
    return NextResponse.json({ ingredient, count: results.length, results });
  } catch (error) {
    console.error("Single ingredient search failed:", error);
    return NextResponse.json(
      { error: "Could not fetch recipes right now. Please try again." },
      { status: 502 }
    );
  }
}
