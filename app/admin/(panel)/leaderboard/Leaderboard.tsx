"use client";

import { useMemo, useState } from "react";
import { saveLeader } from "./actions";
import { Chips } from "../registrations/RegTable";
import { useToast } from "@/components/admin/Toast";
import { CORE } from "@/lib/content";
import type { LeaderRow } from "@/lib/reports";

type Key = "name" | "roll" | "branch" | "year" | "count" | "engagement" | "selected" | `s${number}`;
const SHORT = ["Inaug", "Photo", "Film", "Motion", "Design"];
const COLS = "40px minmax(140px,1.3fr) 110px 64px 56px 80px repeat(5,58px) 84px minmax(150px,1fr) 90px";
const head = "font-mono text-[11px] uppercase tracking-[.1em] text-fg-2";
const tx = "overflow-hidden text-ellipsis whitespace-nowrap";
const cell = "w-full min-w-0 rounded-md border-[1.5px] border-fg/25 bg-[#fff8ec] px-[9px] py-[7px] text-sm text-fg outline-none focus:border-rust";

export default function Leaderboard({ rows: initial }: { rows: LeaderRow[] }) {
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "count", dir: -1 });
  const [q, setQ] = useState("");
  const [f, setF] = useState<"all" | "sel" | "unsel">("all");

  const view = useMemo(() => {
    const val = (r: LeaderRow, k: Key): string | number => {
      if (k.startsWith("s") && k.length === 2 && /\d/.test(k[1])) return r.attended.includes(CORE[Number(k[1])]) ? 1 : 0;
      if (k === "selected") return r.selected ? 1 : 0;
      if (k === "engagement") return r.engagement ?? 0;
      return r[k as "name" | "roll" | "branch" | "year" | "count"];
    };
    const ql = q.trim().toLowerCase();
    return rows
      .filter((r) => (!ql || (r.name + r.roll + r.token).toLowerCase().includes(ql)) && (f === "all" || (f === "sel") === r.selected))
      .sort((a, b) => {
        const x = val(a, sort.key), y = val(b, sort.key);
        const c = x < y ? -sort.dir : x > y ? sort.dir : 0;
        return c || b.count - a.count || (b.engagement ?? 0) - (a.engagement ?? 0);
      });
  }, [rows, sort, q, f]);

  const nsel = rows.filter((r) => r.selected).length;

  async function patch(id: string, p: Parameters<typeof saveLeader>[1]) {
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
    try { await saveLeader(id, p); } catch { setRows(prev); toast("Save failed. Try again."); }
  }

  const cols: [string, Key | null][] = [["#", null], ["Name", "name"], ["Roll", "roll"], ["Branch", "branch"], ["Year", "year"], ["Attended", "count"],
    ...SHORT.map((l, i) => [l, `s${i}` as Key] as [string, Key]), ["Engage", "engagement"], ["Remarks", null], ["Selected", "selected"]];
  const asc = (k: Key) => k === "name" || k === "roll" || k === "branch" || k === "year";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, roll or token"
          className="min-w-0 flex-[0_1_280px] rounded-lg border-[1.5px] border-fg/30 bg-cream-2 px-3.5 py-[11px] text-[15px] text-fg outline-none focus:border-rust" />
        <Chips opts={[["all", "All"], ["sel", "Selected"], ["unsel", "Not selected"]]} value={f} set={setF} />
        <span className={`ml-auto font-bold ${nsel > 90 ? "text-err" : ""}`}>Selected {nsel} / 90{nsel > 90 ? " · over the limit" : ""}</span>
      </div>
      <div className="overflow-x-auto rounded-[10px] border border-fg/[.18] bg-cream-2">
        <div className="min-w-[1240px]">
          <div className="grid items-center gap-3 border-b border-fg/[.18] bg-hdr px-4 py-3" style={{ gridTemplateColumns: COLS }}>
            {cols.map(([l, k]) => (
              <button key={l} disabled={!k} className={`${head} border-0 bg-transparent p-0 text-left ${k ? "cursor-pointer" : ""}`}
                onClick={() => k && setSort((s) => ({ key: k, dir: s.key === k ? (-s.dir as 1 | -1) : asc(k) ? 1 : -1 }))}>
                {l}{k && sort.key === k ? (sort.dir > 0 ? " ↑" : " ↓") : ""}
              </button>
            ))}
          </div>
          {view.map((r, i) => (
            <div key={r.id} className="grid items-center gap-3 border-b border-fg/10 px-4 py-[9px] text-[15px]" style={{ gridTemplateColumns: COLS }}>
              <span className="font-mono text-[13px] text-fg-3">{i + 1}</span>
              <span className={`font-bold ${tx}`}>{r.name}</span>
              <span className={`font-mono text-[13px] ${tx}`}>{r.roll}</span>
              <span className={tx}>{r.branch}</span>
              <span className={tx}>{r.year}</span>
              <span className={`font-bold ${r.count >= 4 ? "text-ok" : ""}`}>{r.count}/5</span>
              {CORE.map((k) => { const on = r.attended.includes(k); return <span key={k} className={`font-bold ${on ? "text-ok" : "text-fg/30"}`}>{on ? "✓" : "–"}</span>; })}
              <input type="number" defaultValue={r.engagement ?? ""} placeholder="0" className={cell}
                onBlur={(e) => { const v = e.target.value === "" ? null : Number(e.target.value); if (v !== r.engagement) patch(r.id, { engagement: v }); }} />
              <input defaultValue={r.remarks} placeholder="Add a remark" className={cell}
                onBlur={(e) => { if (e.target.value !== r.remarks) patch(r.id, { remarks: e.target.value }); }} />
              <button onClick={() => patch(r.id, { selected: !r.selected })}
                className={`cursor-pointer justify-self-start rounded-full border-[1.5px] px-3 py-[5px] text-[13px] font-bold ${r.selected ? "border-ok bg-ok text-white" : "border-fg/35 bg-transparent text-fg"}`}>
                {r.selected ? "Selected" : "Select"}
              </button>
            </div>
          ))}
          {view.length === 0 && <div className="px-4 py-6 text-fg-3">No students match.</div>}
        </div>
      </div>
    </div>
  );
}
