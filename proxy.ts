import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  authCookieOptions,
  tokenExpiresSoon,
} from "@/lib/auth/cookies";
import { createAuthClient } from "@/lib/supabase/auth-client";

/**
 * Next.js 16 proxy (formerly "middleware").
 * Keeps users signed in: when the access token is missing or about to
 * expire, it is refreshed here, because Server Components can't set cookies.
 */
export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken || (accessToken && !tokenExpiresSoon(accessToken))) {
    return NextResponse.next();
  }

  try {
    const { data, error } = await createAuthClient().auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      // Refresh token is invalid or revoked: sign the user out.
      request.cookies.delete(ACCESS_TOKEN_COOKIE);
      request.cookies.delete(REFRESH_TOKEN_COOKIE);
      const response = NextResponse.next({ request: { headers: request.headers } });
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    const { session } = data;

    // Update the request so this page render sees the new token...
    request.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token);
    request.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token);
    const response = NextResponse.next({ request: { headers: request.headers } });

    // ...and the response so the browser keeps it.
    response.cookies.set(
      ACCESS_TOKEN_COOKIE,
      session.access_token,
      authCookieOptions(session.expires_in),
    );
    response.cookies.set(
      REFRESH_TOKEN_COOKIE,
      session.refresh_token,
      authCookieOptions(REFRESH_TOKEN_MAX_AGE),
    );

    return response;
  } catch {
    // Supabase unreachable: leave cookies alone and try again next request.
    return NextResponse.next();
  }
}

export const config = {
  // Skip static files and images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
