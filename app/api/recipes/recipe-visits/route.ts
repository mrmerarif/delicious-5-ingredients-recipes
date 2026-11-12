import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { provider, recipeId, eventId } = body as Record<
    string,
    unknown
  >;

  if (
    typeof provider !== "string" ||
    provider.trim().length === 0 ||
    provider.length > 40 ||
    typeof recipeId !== "string" ||
    recipeId.trim().length === 0 ||
    recipeId.length > 100 ||
    typeof eventId !== "string" ||
    !uuidPattern.test(eventId)
  ) {
    return NextResponse.json(
      { error: "Invalid visit data" },
      { status: 400 },
    );
  }

  try {
    const { error } = await getSupabase()
      .from("recipe_visits")
      .insert({
        event_id: eventId,
        provider,
        recipe_id: recipeId,
      });

    // The same event was already recorded. Do not count it twice.
    if (error?.code === "23505") {
      return new Response(null, { status: 204 });
    }

    // The recipe must exist in our catalog before recording visits.
    if (error?.code === "23503") {
      return NextResponse.json(
        { error: "Unknown recipe" },
        { status: 404 },
      );
    }

    if (error) {
      console.error("Visit insert failed:", error.code);

      return NextResponse.json(
        { error: "Unable to record visit" },
        { status: 500 },
      );
    }

    return new Response(null, { status: 204 });
  } catch {
    console.error("Visit tracking endpoint failed");

    return NextResponse.json(
      { error: "Unable to record visit" },
      { status: 500 },
    );
  }
}