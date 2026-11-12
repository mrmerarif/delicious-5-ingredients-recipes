import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase.rpc("get_top_recipes");

    if (error) {
      console.error("Top recipes query failed:", error.code);

      return NextResponse.json(
        { error: "Unable to load popular recipes" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { recipes: data ?? [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    console.error("Top recipes endpoint failed");

    return NextResponse.json(
      { error: "Unable to load popular recipes" },
      { status: 500 },
    );
  }
}