"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/lib/auth/actions";
import { authCopy } from "@/lib/auth/copy";
import type { Locale } from "@/lib/i18n/config";

type CurrentUser = {
  id: string;
  email: string | null;
  displayName: string | null;
};

interface AuthLinksProps {
  locale: Locale;
  loginLabel: string;
  signupLabel: string;
  onNavigate?: () => void;
  className?: string;
}

const linkStyle =
  "inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--header-nav-text)] transition-colors duration-200 hover:bg-[var(--header-language-active-bg)] hover:text-[var(--header-language-active-text)]";

export default function AuthLinks({
  locale,
  loginLabel,
  signupLabel,
  onNavigate,
  className = "",
}: AuthLinksProps) {
  const pathname = usePathname();
  // undefined = still loading, null = signed out
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { user: null }))
      .then((body: { user: CurrentUser | null }) => setUser(body.user))
      .catch(() => {
        if (!controller.signal.aborted) setUser(null);
      });

    return () => controller.abort();
  }, [pathname]);

  if (user === undefined) {
    return <div className={className} aria-hidden="true" />;
  }

  if (user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="max-w-40 truncate px-2 text-sm text-[var(--header-nav-text)]" title={user.email ?? undefined}>
          {user.displayName || user.email}
        </span>
        <form action={signOut}>
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className={linkStyle} onClick={onNavigate}>
            {authCopy[locale].signOut}
          </button>
        </form>
      </div>
    );
  }

  // Bring the visitor back to the current page after logging in.
  const next = pathname.endsWith("/login") || pathname.endsWith("/signup")
    ? ""
    : `?next=${encodeURIComponent(pathname)}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Link href={`/${locale}/login${next}`} className={linkStyle} onClick={onNavigate}>
        {loginLabel}
      </Link>
      <Link href={`/${locale}/signup${next}`} className="btn-accent text-sm" onClick={onNavigate}>
        {signupLabel}
      </Link>
    </div>
  );
}
