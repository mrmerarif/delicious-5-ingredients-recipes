import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";

/** Who is signed in? Used by the header. Returns { user: null } when signed out. */
export async function GET() {
  const user = await getCurrentUser();

  const body = user
    ? {
        user: {
          id: user.id,
          email: user.email ?? null,
          displayName:
            typeof user.user_metadata?.display_name === "string"
              ? user.user_metadata.display_name
              : null,
        },
      }
    : { user: null };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
