
import { Suspense } from "react";
import { notFound } from "next/navigation";

import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import MealPlannerContent from "../../../components/meal-planner/MealPlannerContent";

import { isValidLocale } from "../../../lib/i18n/config";
import { getDictionary } from "../../../lib/i18n/dictionaries";

interface MealPlannerPageProps {
  params: Promise<{
    locale: string;
  }>;
}

async function MealPlannerPageContent({
  params,
}: MealPlannerPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

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
        <MealPlannerContent locale={locale} />
      </main>

      <Footer
        locale={locale}
        dictionary={dictionary}
      />
    </>
  );
}

function MealPlannerLoading() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-1 items-center justify-center bg-[var(--background)] px-6"
    >
      <p
        role="status"
        className="text-lg text-[var(--text-muted)]"
      >
        Loading Meal Planner...
      </p>
    </main>
  );
}

export default function MealPlannerPage({
  params,
}: MealPlannerPageProps) {
  return (
    <Suspense fallback={<MealPlannerLoading />}>
      <MealPlannerPageContent params={params} />
    </Suspense>
  );
}
