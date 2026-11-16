
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Delicious 5 Ingredients Recipes",
    template: "%s | Delicious 5 Ingredients Recipes",
  },
  description:
    "Discover easy and delicious recipes using ingredients you already have. Find meal ideas, explore recipes, and make everyday cooking simple.",
  applicationName: "Delicious 5 Ingredients Recipes",
  keywords: [
    "easy recipes",
    "5 ingredient recipes",
    "recipes by ingredients",
    "meal ideas",
    "quick meals",
    "simple cooking",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
