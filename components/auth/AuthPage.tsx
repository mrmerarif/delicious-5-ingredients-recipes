import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthForm from "@/components/auth/AuthForm";
import { authCopy } from "@/lib/auth/copy";
import { getCurrentUser } from "@/lib/auth/session";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export type AuthPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Only keep `next` if it is a path on this site. */
function safeNext(value: string | string[] | undefined) {
  const next = (Array.isArray(value) ? value[0] : value) ?? "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next.slice(0, 300)
    : "";
}

async function AuthContent({ mode, locale, searchParams }: {
  mode: "login" | "signup";
  locale: Locale;
  searchParams: AuthPageProps["searchParams"];
}) {
  const next = safeNext((await searchParams).next);

  // Already signed in? Skip the form.
  if (await getCurrentUser()) {
    redirect(next || `/${locale}`);
  }

  return <AuthForm mode={mode} locale={locale} next={next} text={authCopy[locale]} />;
}

async function LocalizedAuthPage({ mode, params, searchParams }: AuthPageProps & {
  mode: "login" | "signup";
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const text = authCopy[locale];
  const isSignup = mode === "signup";

  return (
    <>
      <Header locale={locale} dictionary={dictionary} />
      <main id="main-content" className="site-container flex justify-center py-10 sm:py-14">
        <div className="w-full max-w-md rounded-[var(--radius-large)] border border-[var(--border-color)] bg-[var(--surface-muted)] p-6 sm:p-8">
          <h1 className="text-3xl font-bold">{isSignup ? text.signupTitle : text.loginTitle}</h1>
          <p className="mb-6 mt-2 text-[var(--text-muted)]">
            {isSignup ? text.signupIntro : text.loginIntro}
          </p>
          <Suspense fallback={<p role="status">{text.pending}</p>}>
            <AuthContent mode={mode} locale={locale} searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
      <Footer locale={locale} dictionary={dictionary} />
    </>
  );
}

export default function AuthPage(props: AuthPageProps & { mode: "login" | "signup" }) {
  return (
    <Suspense>
      <LocalizedAuthPage {...props} />
    </Suspense>
  );
}
