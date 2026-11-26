"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signIn, signUp } from "@/lib/auth/actions";
import { minPasswordLength, type AuthCopy, type AuthFormState } from "@/lib/auth/copy";
import type { Locale } from "@/lib/i18n/config";

interface AuthFormProps {
  mode: "login" | "signup";
  locale: Locale;
  next: string;
  text: AuthCopy;
}

const inputStyle =
  "w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-3";

const initialState: AuthFormState = {};

export default function AuthForm({ mode, locale, next, text }: AuthFormProps) {
  const isSignup = mode === "signup";
  const [state, formAction, pending] = useActionState(
    isSignup ? signUp : signIn,
    initialState,
  );

  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : "";
  const otherHref = `/${locale}/${isSignup ? "login" : "signup"}${nextQuery}`;

  if (state.message === "checkEmail") {
    return (
      <div className="space-y-4">
        <p role="status" className="rounded-lg bg-[var(--surface-muted)] p-4">
          {text.checkEmail}
        </p>
        <Link className="underline" href={`/${locale}/login${nextQuery}`}>
          {text.goToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="next" value={next} />

      {state.error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {text.errors[state.error]}
        </p>
      )}

      {isSignup && (
        <label className="block space-y-2 font-semibold">
          <span>
            {text.displayName}{" "}
            <span className="font-normal text-[var(--text-muted)]">({text.optional})</span>
          </span>
          <input type="text" name="displayName" autoComplete="name" maxLength={60} className={inputStyle} />
        </label>
      )}

      <label className="block space-y-2 font-semibold">
        <span>{text.email}</span>
        <input type="email" name="email" autoComplete="email" required maxLength={254} className={inputStyle} />
      </label>

      <label className="block space-y-2 font-semibold">
        <span>{text.password}</span>
        <input
          type="password"
          name="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={isSignup ? minPasswordLength : undefined}
          maxLength={72}
          className={inputStyle}
        />
        {isSignup && (
          <span className="block text-sm font-normal text-[var(--text-muted)]">{text.passwordHint}</span>
        )}
      </label>

      {isSignup && (
        <label className="block space-y-2 font-semibold">
          <span>{text.confirmPassword}</span>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            maxLength={72}
            className={inputStyle}
          />
        </label>
      )}

      <button className="btn-primary w-full" type="submit" disabled={pending} aria-busy={pending}>
        {pending ? text.pending : isSignup ? text.signupButton : text.loginButton}
      </button>

      <p className="text-center text-sm">
        {isSignup ? text.haveAccount : text.noAccount}{" "}
        <Link className="font-semibold underline" href={otherHref}>
          {isSignup ? text.goToLogin : text.goToSignup}
        </Link>
      </p>
    </form>
  );
}
