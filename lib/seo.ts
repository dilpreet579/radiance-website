import type { Metadata } from "next";
import { PAGE_META } from "@/lib/content";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://radiance26.tech").replace(/\/$/, "");

export const PUBLIC_PATHS = ["/", "/workshops", "/inaugural", "/photowalk", "/competitions", "/exhibition", "/register"];

// schema.org Event for the home page. Venue is the campus only: the admin-set inaugural venue changes, so it stays out of structured data.
export const EVENT_LD = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Radiance 2026 · NIT Delhi Annual Creative Fest",
  description: "Workshops, a Delhi photo walk, competitions and a grand exhibition across photography, filmmaking, motion design and graphic design.",
  startDate: "2026-10-26",
  endDate: "2026-11-05",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: { "@type": "Place", name: "National Institute of Technology Delhi", address: { "@type": "PostalAddress", addressLocality: "New Delhi", addressRegion: "Delhi", addressCountry: "IN" } },
  image: `${SITE_URL}/opengraph-image.png`,
  url: SITE_URL,
  organizer: { "@type": "Organization", name: "Clairvoyance, NIT Delhi", url: SITE_URL, email: "clairvoyance@nitdelhi.ac.in" },
  offers: { "@type": "Offer", url: `${SITE_URL}/register`, price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock" },
};

// Per-page title/description/canonical; title and description default to PAGE_META. The root layout's title template adds the site name.
export const pageMeta = (path: string, title = PAGE_META[path]?.title, description = PAGE_META[path]?.lead): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  // A page-level openGraph replaces the layout's wholesale, so the shared fields and image are repeated here.
  openGraph: { type: "website", siteName: "Radiance 2026", locale: "en_IN", title, description, url: path, images: ["/opengraph-image.png"] },
  twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image.png"] },
});
