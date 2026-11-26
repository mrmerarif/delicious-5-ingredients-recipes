import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client that uses the publishable (anon) key.
 *
 * - Without a token: used for sign up / sign in / refresh.
 * - With the user's access token: database queries run AS that user,
 *   so Row Level Security policies using auth.uid() apply.
 *
 * Never use the secret key for user data; use this instead.
 */
export function createAuthClient(accessToken?: string) {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Missing Supabase auth environment variables");
  }

  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
}
