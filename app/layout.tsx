import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, DM_Mono, Creepster } from "next/font/google";
import "./globals.css";
import Chrome from "@/components/Chrome";
import { getTitleSponsor } from "@/lib/sponsors";
import { SITE_URL } from "@/lib/seo";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["500", "700", "800"] });
const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const dmMono = DM_Mono({ variable: "--font-dm-mono", subsets: ["latin"], weight: ["400", "500"] });
const creepster = Creepster({ variable: "--font-creepster", subsets: ["latin"], weight: "400" });

const TITLE = "Radiance 2026 · NIT Delhi Annual Creative Fest";
const DESC = "3rd edition of NIT Delhi's Annual Creative Fest, 26 Oct – 5 Nov 2026: workshops, photo walk, competitions and a grand exhibition. Organised by Clairvoyance, presented by Bharat Petroleum.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | Radiance 2026" },
  description: DESC,
  applicationName: "Radiance 2026",
  keywords: ["Radiance 2026", "NIT Delhi", "Clairvoyance", "creative fest", "photography workshop", "filmmaking workshop", "photo walk Delhi"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Radiance 2026", locale: "en_IN", title: TITLE, description: DESC, url: "/" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

export const revalidate = 60;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sponsor = await getTitleSponsor();
  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable} ${dmMono.variable} ${creepster.variable}`}>
      <body>
        <Chrome sponsor={sponsor}>{children}</Chrome>
      </body>
    </html>
  );
}
