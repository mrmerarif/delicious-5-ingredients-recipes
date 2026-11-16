
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js development indicator
  devIndicators: false,

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
