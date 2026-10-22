import { db } from "./db";
import { CORE } from "./content";

export type LeaderRow = {
  id: string; name: string; roll: string; branch: string; year: string; token: string;
  attended: string[]; count: number; engagement: number | null; remarks: string; selected: boolean;
};

// Supabase caps selects at 1000 rows; volume here is ~300 so a single page is fine.
export async function leaderboard(): Promise<LeaderRow[]> {
  const sb = db();
  const [{ data: regs }, { data: scans }] = await Promise.all([
    sb.from("registrations").select("id,name,roll,branch,year,token,engagement,remarks,walk_selected").eq("is_nit", true),
    sb.from("scans").select("registration_id,session_key").in("session_key", [...CORE]),
  ]);
  const by = new Map<string, string[]>();
  for (const s of scans ?? []) by.set(s.registration_id, [...(by.get(s.registration_id) ?? []), s.session_key]);
  return (regs ?? [])
    .map((r) => {
      const attended = by.get(r.id) ?? [];
      return { id: r.id, name: r.name, roll: r.roll, branch: r.branch, year: r.year, token: r.token, attended, count: attended.length,
        engagement: r.engagement, remarks: r.remarks ?? "", selected: r.walk_selected };
    })
    .sort((a, b) => b.count - a.count || (b.engagement ?? -1) - (a.engagement ?? -1) || a.name.localeCompare(b.name));
}

export function toCsv(rows: (string | number | boolean | null)[][]) {
  const cell = (v: string | number | boolean | null) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(cell).join(",")).join("\n");
}
