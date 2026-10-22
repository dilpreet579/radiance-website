import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "5mb" } }, // sponsor logo uploads
  // The ticket email image (lib/ticket-image.tsx) reads fonts and images from disk at runtime, which file tracing can't see.
  outputFileTracingIncludes: { "/register": ["./assets/**/*", "./public/radiance26-logo.png"] },
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
