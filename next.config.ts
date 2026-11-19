
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js development indicator
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.themealdb.com", pathname: "/images/media/meals/**" },
    ],
  },

  // Existing project configuration
  cacheComponents: true,
  partialPrefetching: true,

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
