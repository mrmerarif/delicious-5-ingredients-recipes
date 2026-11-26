"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getValidLocale } from "@/lib/i18n/config";
import { getSupabase } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth-client";
import { ACCESS_TOKEN_COOKIE } from "./cookies";
import { clearSession, saveSession } from "./session";
import { minPasswordLength, type AuthErrorCode, type AuthFormState } from "./copy";

// "use server" files may only export async functions, so constants live in ./copy.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Only allow redirects back to a path on this site. */
function safeNext(locale: string, value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return value;
  }

  return `/${locale}`;
}

function fail(error: AuthErrorCode): AuthFormState {
  return { error };
}

export async function signIn(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const locale = getValidLocale(text(formData, "locale"));
  const email = text(formData, "email").trim().toLowerCase();
  const password = text(formData, "password");

  if (!email || !password) return fail("missingFields");
  if (!emailPattern.test(email) || email.length > 254) return fail("invalidEmail");

  let session;

  try {
    const { data, error } = await createAuthClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.code === "email_not_confirmed") return fail("emailNotConfirmed");
      if (error.status === 429) return fail("rateLimited");
      return fail("invalidCredentials");
    }

    session = data.session;
  } catch {
    return fail("unavailable");
  }

  if (!session) return fail("invalidCredentials");

  await saveSession(session);
  redirect(safeNext(locale, text(formData, "next")));
}

export async function signUp(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const locale = getValidLocale(text(formData, "locale"));
  const displayName = text(formData, "displayName").trim().slice(0, 60);
  const email = text(formData, "email").trim().toLowerCase();
  const password = text(formData, "password");
  const confirmPassword = text(formData, "confirmPassword");

  if (!email || !password || !confirmPassword) return fail("missingFields");
  if (!emailPattern.test(email) || email.length > 254) return fail("invalidEmail");
  if (password.length < minPasswordLength || password.length > 72) return fail("passwordTooShort");
  if (password !== confirmPassword) return fail("passwordMismatch");

  let session;

  try {
    const { data, error } = await createAuthClient().auth.signUp({
      email,
      password,
      options: {
        data: displayName ? { display_name: displayName } : {},
      },
    });

    if (error) {
      if (error.code === "user_already_exists" || error.code === "email_exists") {
        return fail("emailTaken");
      }
      if (error.code === "weak_password") return fail("weakPassword");
      if (error.status === 429) return fail("rateLimited");
      return fail("unavailable");
    }

    session = data.session;
  } catch {
    return fail("unavailable");
  }

  // Email confirmation is on in Supabase: no session until they click the link.
  if (!session) return { message: "checkEmail" };

  await saveSession(session);
  redirect(safeNext(locale, text(formData, "next")));
}

export async function signOut(formData: FormData) {
  const locale = getValidLocale(text(formData, "locale"));
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken) {
    try {
      // Revokes this device's refresh token on the Supabase side.
      await getSupabase().auth.admin.signOut(accessToken, "local");
    } catch {
      // Cookies are cleared below either way.
    }
  }

  await clearSession();
  redirect(`/${locale}`);
}
