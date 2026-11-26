/**
 * Auth cookie names and helpers.
 *
 * Kept free of "server-only" so proxy.ts can import it too.
 * The tokens live in httpOnly cookies, so browser JavaScript never sees them.
 */

export const ACCESS_TOKEN_COOKIE = "d5r-access-token";
export const REFRESH_TOKEN_COOKIE = "d5r-refresh-token";

// How long a refresh token cookie is kept (30 days).
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

export function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/**
 * True when the access token is missing an expiry, can't be read,
 * or expires within `skewSeconds`. Only used to decide when to refresh;
 * the token itself is always verified by Supabase.
 */
export function tokenExpiresSoon(token: string, skewSeconds = 60): boolean {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: unknown };

    return typeof exp !== "number" || exp * 1000 - Date.now() < skewSeconds * 1000;
  } catch {
    return true;
  }
}
