
import { Suspense } from "react";
import { notFound } from "next/navigation";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

import HeroSection from "../../components/home/HeroSection";
import FeaturedRecipes from "../../components/home/FeaturedRecipes";
import KitchenEssentialsCarousel from "../../components/home/KitchenEssentialsCarousel";

import {
  isValidLocale,
  locales,
} from "../../lib/i18n/config";

import { getDictionary } from "../../lib/i18n/dictionaries";

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

async function LocalizedHome({
  params,
}: HomePageProps) {
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

      <main id="main-content">
        {/* Main recipe search hero */}
        <HeroSection
          locale={locale}
          dictionary={dictionary}
        />

        {/* Compact kitchen essentials carousel */}
        <KitchenEssentialsCarousel
          locale={locale}
          dictionary={dictionary}
        />

        {/* Featured recipes */}
        <FeaturedRecipes
          locale={locale}
          dictionary={dictionary}
        />
      </main>

      <Footer
        locale={locale}
        dictionary={dictionary}
      />
    </>
  );
}

function HomeLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <p className="text-lg text-[var(--text-muted)]">
        Loading...
      </p>
    </main>
  );
}

export default function HomePage({
  params,
}: HomePageProps) {
  return (
    <Suspense fallback={<HomeLoading />}>
      <LocalizedHome params={params} />
    </Suspense>
  );
}
