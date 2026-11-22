
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js development indicator
  devIndicators: false,

  // Existing project configuration
  cacheComponents: true,
  partialPrefetching: true,

  // Allow recipe images from TheMealDB.
  // Keep external image access restricted to trusted sources.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.themealdb.com",
        pathname: "/images/**",
      },
    ],
  },

  // Tailwind CSS 4 with Turbopack
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
