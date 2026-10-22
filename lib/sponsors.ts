import { db, hasDb } from "./db";

export type Sponsor = { name: string; tagline: string; logo_url: string; link: string };

const FALLBACK: Sponsor = {
  name: "Bharat Petroleum",
  tagline: "Radiance 2026 is proudly presented by Bharat Petroleum",
  logo_url: "",
  link: "https://www.bharatpetroleum.in",
};

export async function getTitleSponsor(): Promise<Sponsor> {
  if (!hasDb()) return FALLBACK;
  try {
    const { data } = await db().from("sponsors").select("name,tagline,logo_url,link").eq("tier", "title").order("position").limit(1).maybeSingle();
    return data ? { ...FALLBACK, ...data, tagline: data.tagline || FALLBACK.tagline } : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export async function getAssociateSponsors(): Promise<Sponsor[]> {
  if (!hasDb()) return [];
  try {
    const { data } = await db().from("sponsors").select("name,tagline,logo_url,link").eq("tier", "associate").order("position");
    return data ?? [];
  } catch {
    return [];
  }
}
