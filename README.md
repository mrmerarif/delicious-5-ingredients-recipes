# delicious-5-ingredients-recipes
CSE 499 Senior Project – A recipe search website that helps users discover meals using one or more ingredients.
## Favorite Quote

"Great things are done by a series of small things brought together."
— Vincent van Gogh

"Code never lies, comments sometimes do."
— Ron Jeffries

## Authentication (Sign up / Sign in)

Email + password accounts with Supabase Auth.

- Pages: `/{locale}/signup` and `/{locale}/login` (links are in the header, which also shows a Sign out button when signed in).
- Tokens are kept in httpOnly cookies. `proxy.ts` refreshes them automatically so users stay signed in.
- Sign up creates a row in `public.profiles` (migration `20261125000000_create_profiles.sql`).

### Setup

1. Add `SUPABASE_PUBLISHABLE_KEY` to `.env.local` (Supabase dashboard → Project Settings → API Keys). See `.env.example`.
2. Run the new migration (`supabase db push`, or paste it into the SQL Editor).
3. Supabase dashboard → Authentication → Sign In / Providers → Email: keep it enabled. For quick testing you can turn **Confirm email** off; with it on, users must click the email link before signing in.

### Saving data for the signed-in user

```ts
import { getCurrentUser, getUserSupabase, requireUser } from "@/lib/auth/session";

// API route: reject signed-out users
const user = await getCurrentUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// Query as the user, so RLS applies (rows need a user_id column)
const supabase = await getUserSupabase();
await supabase!.from("meal_plans").insert({ user_id: user.id, /* ... */ });

// Page that requires login (redirects to /{locale}/login and back)
const user = await requireUser(locale, `/${locale}/meal-planner`);
```

For a new per-user table, add `user_id uuid not null references auth.users (id) on delete cascade`, enable RLS, and add policies with `using ((select auth.uid()) = user_id)`. See the profiles migration for an example.
