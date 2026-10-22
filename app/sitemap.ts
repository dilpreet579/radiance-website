import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, SITE_URL } from "@/lib/seo";

// No lastModified: pages are edited from the admin panel and a made-up date would mislead crawlers.
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((p) => ({ url: SITE_URL + (p === "/" ? "" : p), priority: p === "/" ? 1 : p === "/register" ? 0.9 : 0.7 }));
}
