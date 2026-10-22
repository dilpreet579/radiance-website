"use client";

import { useState } from "react";

export type Reg = { token: string; name: string; inst: string; roll: string; year: string; branch: string; nit: boolean; at: string };

const COLS = "110px minmax(150px,1.4fr) minmax(120px,1fr) 120px 60px 70px 110px 90px";
const head = "font-mono text-[11px] uppercase tracking-[.1em] text-fg-2";
const tx = "overflow-hidden text-ellipsis whitespace-nowrap";

export function Chips<T extends string>({ opts, value, set }: { opts: [T, string][]; value: T; set: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map(([k, l]) => (
        <button key={k} onClick={() => set(k)} className={`min-h-11 cursor-pointer whitespace-nowrap rounded-full border-[1.5px] px-4 text-[15px] font-semibold ${value === k ? "border-gold bg-gold text-bg" : "border-fg/30 bg-transparent text-fg"}`}>{l}</button>
      ))}
    </div>
  );
}

export default function RegTable({ rows }: { rows: Reg[] }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState<"all" | "nit" | "out">("all");
  const ql = q.trim().toLowerCase();
  const view = rows.filter((r) => (!ql || (r.name + r.roll + r.token).toLowerCase().includes(ql)) && (f === "all" || (f === "nit") === r.nit));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, roll or token"
          className="min-w-0 flex-[0_1_280px] rounded-lg border-[1.5px] border-fg/30 bg-cream-2 px-3.5 py-[11px] text-[15px] text-fg outline-none focus:border-rust" />
        <Chips opts={[["all", "All"], ["nit", "NIT Delhi"], ["out", "Outside"]]} value={f} set={setF} />
        <span className="ml-auto font-bold">{view.length} of {rows.length} shown</span>
      </div>
      <div className="overflow-x-auto rounded-[10px] border border-fg/[.18] bg-cream-2">
        <div className="min-w-[900px]">
          <div className="grid items-center gap-3 border-b border-fg/[.18] bg-hdr px-4 py-3" style={{ gridTemplateColumns: COLS }}>
            {["Token", "Name", "Institute", "Roll", "Year", "Branch", "Pass", "Registered"].map((h) => <span key={h} className={head}>{h}</span>)}
          </div>
          {view.map((r) => (
            <div key={r.token} className="grid items-center gap-3 border-b border-fg/10 px-4 py-[9px] text-[15px]" style={{ gridTemplateColumns: COLS }}>
              <span className={`font-mono text-[13px] ${tx}`}>{r.token}</span>
              <span className={`font-bold ${tx}`}>{r.name}</span>
              <span className={tx}>{r.inst}</span>
              <span className={`font-mono text-[13px] ${tx}`}>{r.roll}</span>
              <span className={tx}>{r.year}</span>
              <span className={tx}>{r.branch}</span>
              <span className={`justify-self-start rounded-full px-2.5 py-[3px] font-mono text-[11px] uppercase tracking-[.08em] ${r.nit ? "bg-panel text-cream" : "border-[1.5px] border-rust text-rust"}`}>{r.nit ? "Universal" : "Workshop"}</span>
              <span className={`text-fg-3 ${tx}`}>{r.at}</span>
            </div>
          ))}
          {view.length === 0 && <div className="px-4 py-6 text-fg-3">No registrations match.</div>}
        </div>
      </div>
    </div>
  );
}
