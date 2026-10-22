import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, DM_Mono, Creepster } from "next/font/google";
import "./globals.css";
import Chrome from "@/components/Chrome";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["500", "700", "800"] });
const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const dmMono = DM_Mono({ variable: "--font-dm-mono", subsets: ["latin"], weight: ["400", "500"] });
const creepster = Creepster({ variable: "--font-creepster", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Radiance 2026 · NIT Delhi Annual Creative Fest",
  description: "3rd edition of NIT Delhi's Annual Creative Fest, 26 Oct – 5 Nov 2026. Presented by Bharat Petroleum.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable} ${dmMono.variable} ${creepster.variable}`}>
      <body>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
