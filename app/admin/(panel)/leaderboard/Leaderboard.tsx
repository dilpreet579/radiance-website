"use client";

import { useMemo, useState } from "react";
import { saveLeader } from "./actions";
import { CORE } from "@/lib/content";
import type { LeaderRow } from "@/lib/reports";

type Key = "name" | "roll" | "branch" | "year" | "count" | "engagement" | "selected";
const SHORT: Record<string, string> = { inaugural: "Inaug", photo: "Photo", film: "Film", motion: "Motion", graphic: "Graphic" };

export default function Leaderboard({ rows: initial }: { rows: LeaderRow[] }) {
  const [rows, setRows] = useState(initial);
  const [key, setKey] = useState<Key>("count");
  const [asc, setAsc] = useState(false);
  const [q, setQ] = useState("");
  const [saveErr, setSaveErr] = useState("");

  const view = useMemo(() => {
    const f = rows.filter((r) => (r.name + r.roll + r.token).toLowerCase().includes(q.toLowerCase()));
    const dir = asc ? 1 : -1;
    return [...f].sort((a, b) => {
      const x = a[key] ?? -1, y = b[key] ?? -1;
      return (typeof x === "string" ? x.localeCompare(String(y)) : Number(x) - Number(y)) * dir;
    });
  }, [rows, key, asc, q]);

  const selectedCount = rows.filter((r) => r.selected).length;

  async function patch(id: string, p: Parameters<typeof saveLeader>[1]) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
    try { await saveLeader(id, p); setSaveErr(""); } catch { setSaveErr("Save failed. Refresh and retry."); }
  }
  const head = (k: Key, l: string) => (
    <th onClick={() => { if (k === key) setAsc(!asc); else { setKey(k); setAsc(false); } }} className="cursor-pointer select-none whitespace-nowrap px-3 py-2 text-left text-xs uppercase tracking-wide text-fg-3">
      {l}{key === k ? (asc ? " ▲" : " ▼") : ""}
    </th>
  );
  const inp = "rounded border border-fg/30 bg-white px-2 py-1 text-sm";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="m-0 mr-auto font-display text-3xl font-extrabold">Leaderboard · {selectedCount}/90 selected</h1>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name / roll / token" className={inp + " w-60"} />
        <a href="/admin/export?type=leaderboard" className="btn btn-rust px-4 py-2 text-sm">Leaderboard CSV</a>
        <a href="/admin/export?type=shortlist" className="btn btn-rust px-4 py-2 text-sm">Shortlist CSV</a>
      </div>
      {saveErr && <div className="font-semibold text-err">{saveErr}</div>}
      <div className="overflow-x-auto rounded-xl border border-fg/10 bg-cream-2">
        <table className="w-full text-sm">
          <thead>
            <tr>{head("name", "Name")}{head("roll", "Roll")}{head("branch", "Branch")}{head("year", "Year")}{head("count", "Attended")}
              {CORE.map((c) => <th key={c} className="px-2 py-2 text-xs uppercase text-fg-3">{SHORT[c]}</th>)}
              {head("engagement", "Engagement")}<th className="px-3 py-2 text-left text-xs uppercase text-fg-3">Remarks</th>{head("selected", "Walk")}</tr>
          </thead>
          <tbody>
            {view.map((r) => (
              <tr key={r.id} className="border-t border-fg/10">
                <td className="px-3 py-2 font-semibold">{r.name}</td><td className="px-3 py-2">{r.roll}</td><td className="px-3 py-2">{r.branch}</td><td className="px-3 py-2">{r.year}</td>
                <td className="px-3 py-2 font-bold">{r.count}/5</td>
                {CORE.map((c) => <td key={c} className="px-2 py-2 text-center">{r.attended.includes(c) ? "✓" : "·"}</td>)}
                <td className="px-3 py-2"><input type="number" step="0.5" defaultValue={r.engagement ?? ""} className={inp + " w-20"}
                  onBlur={(e) => { const v = e.target.value === "" ? null : Number(e.target.value); if (v !== r.engagement) patch(r.id, { engagement: v }); }} /></td>
                <td className="px-3 py-2"><input defaultValue={r.remarks} className={inp + " w-44"} onBlur={(e) => { if (e.target.value !== r.remarks) patch(r.id, { remarks: e.target.value }); }} /></td>
                <td className="px-3 py-2 text-center"><input type="checkbox" checked={r.selected} className="h-5 w-5" onChange={(e) => patch(r.id, { selected: e.target.checked })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
