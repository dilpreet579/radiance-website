import { db, hasDb } from "./db";
import { CONSENTS, NOTES } from "./content";

export type Consent = { key: string; t: string; d: string };
export type Settings = {
  seat_cap: number;
  venue: string;
  notes: { k: string; t: string }[];
  consents: { nit: Consent[]; outside: Consent[] };
  competitions_live: boolean;
};

const DEFAULTS: Settings = {
  seat_cap: 15,
  venue: "To be announced",
  notes: NOTES,
  consents: CONSENTS,
  competitions_live: process.env.NEXT_PUBLIC_COMPETITIONS_LIVE === "true",
};

// Every public page tolerates a missing/empty DB by falling back to the static defaults.
export async function getSettings(): Promise<Settings> {
  if (!hasDb()) return DEFAULTS;
  try {
    const { data } = await db().from("settings").select("key,value");
    const s = { ...DEFAULTS } as Record<string, unknown>;
    for (const r of data ?? []) s[r.key] = r.value;
    return s as Settings;
  } catch {
    return DEFAULTS;
  }
}

export async function setSetting(key: keyof Settings, value: unknown) {
  const { error } = await db().from("settings").upsert({ key, value });
  if (error) throw error;
}

// Outside-student seats taken per workshop.
export async function seatsTaken(): Promise<Record<string, number>> {
  const out: Record<string, number> = { photo: 0, film: 0, motion: 0, graphic: 0 };
  if (!hasDb()) return out;
  try {
    const { data } = await db().from("registrations").select("workshops").eq("is_nit", false);
    for (const r of data ?? []) for (const w of r.workshops as string[]) out[w] = (out[w] ?? 0) + 1;
  } catch {}
  return out;
}
