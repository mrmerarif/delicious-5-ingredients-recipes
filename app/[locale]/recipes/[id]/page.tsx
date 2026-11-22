
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import RecipeDetails from "../../../../components/recipes/RecipeDetails";
import AddToMealPlanner from "../../../../components/recipes/AddToMealPlanner";
import SearchAnotherRecipe from "../../../../components/recipes/SearchAnotherRecipe";

import {
  getLocalizedPath,
  isValidLocale,
} from "../../../../lib/i18n/config";

import { getDictionary } from "../../../../lib/i18n/dictionaries";
import { getLocalizedRecipe } from "../../../../lib/recipes/getLocalizedRecipe";

interface RecipeDetailsPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

async function RecipeDetailsContent({
  params,
}: RecipeDetailsPageProps) {
  const { locale, id } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const recipe = await getLocalizedRecipe(id, locale);

  const actionClass =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--fsm-accent)] px-4 py-2 text-center text-sm font-semibold text-[var(--fsm-accent)] transition-colors hover:bg-[var(--surface-muted)]";

  return (
    <>
      <Header
        locale={locale}
        dictionary={dictionary}
      />

      <main
        id="main-content"
        className="flex-1 bg-[var(--background)]"
      >
        <div className="site-container py-12 lg:py-16">
          {recipe ? (
            <>
              <div className="mb-8 grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
                <div className="flex justify-start">
                  <Link
                    href={getLocalizedPath(
                      locale,
                      "/recipes"
                    )}
                    className={actionClass}
                  >
                    <span aria-hidden="true">←</span>
                    {dictionary.recipes.viewAll}
                  </Link>
                </div>

                <div className="flex justify-start sm:justify-center">
                  <SearchAnotherRecipe locale={locale} />
                </div>

                <div className="flex justify-start sm:justify-end">
                  <AddToMealPlanner
                    recipe={recipe}
                    locale={locale}
                  />
                </div>
              </div>

              <RecipeDetails
                recipe={recipe}
                dictionary={dictionary}
              />
            </>
          ) : (
            <>
              <Link
                href={getLocalizedPath(
                  locale,
                  "/recipes"
                )}
                className={actionClass}
              >
                <span aria-hidden="true">←</span>
                {dictionary.recipes.viewAll}
              </Link>

              <section
                className="py-16 text-center"
                aria-labelledby="recipe-not-found-title"
              >
                <h1
                  id="recipe-not-found-title"
                  className="text-3xl font-bold text-[var(--foreground)]"
                >
                  {dictionary.recipes.notAvailable}
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-[var(--text-muted)]">
                  {dictionary.search.noResults}
                </p>

                <Link
                  href={getLocalizedPath(locale)}
                  className="btn-primary mt-8 inline-flex"
                >
                  {dictionary.navigation.home}
                </Link>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer
        locale={locale}
        dictionary={dictionary}
      />
    </>
  );
}

function RecipeDetailsLoading() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6">
      <p
        role="status"
        className="text-lg text-[var(--text-muted)]"
      >
        Loading...
      </p>
    </main>
  );
}

export default function RecipeDetailsPage({
  params,
}: RecipeDetailsPageProps) {
  return (
    <Suspense fallback={<RecipeDetailsLoading />}>
      <RecipeDetailsContent params={params} />
    </Suspense>
  );
}

