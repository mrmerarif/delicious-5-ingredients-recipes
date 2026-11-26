import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";

import { createAuthClient } from "@/lib/supabase/auth-client";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  authCookieOptions,
} from "./cookies";

/**
 * Returns the signed-in user, or null.
 * The token is verified with Supabase on every call.
 *
 * Use in Server Components, Server Actions, and Route Handlers:
 *   const user = await getCurrentUser();
 *   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *   // save rows with user_id: user.id
 */
export async function getCurrentUser(): Promise<User | null> {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const { data, error } = await createAuthClient().auth.getUser(accessToken);
    return error ? null : data.user;
  } catch {
    return null;
  }
}

/**
 * Like getCurrentUser, but sends signed-out visitors to the login page.
 * `next` is where they come back to after logging in.
 */
export async function requireUser(locale: string, next?: string): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    const query = next ? `?next=${encodeURIComponent(next)}` : "";
    redirect(`/${locale}/login${query}`);
  }

  return user;
}

/**
 * Supabase client that queries the database as the signed-in user,
 * so RLS policies like `auth.uid() = user_id` protect each user's rows.
 * Returns null when nobody is signed in.
 */
export async function getUserSupabase() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  return accessToken ? createAuthClient(accessToken) : null;
}

/** Stores a new session. Only callable from Server Actions / Route Handlers. */
export async function saveSession(session: Session) {
  const store = await cookies();

  store.set(
    ACCESS_TOKEN_COOKIE,
    session.access_token,
    authCookieOptions(session.expires_in),
  );
  store.set(
    REFRESH_TOKEN_COOKIE,
    session.refresh_token,
    authCookieOptions(REFRESH_TOKEN_MAX_AGE),
  );
}

/** Removes the session cookies. Only callable from Server Actions / Route Handlers. */
export async function clearSession() {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}
