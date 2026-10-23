"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import { deleteRegistration } from "./actions";

export type Reg = {
  id: string;
  token: string;
  name: string;
  inst: string;
  roll: string;
  year: string;
  branch: string;
  nit: boolean;
  at: string;
};

const COLS = "110px minmax(140px,1.4fr) minmax(110px,1fr) 110px 50px 60px 95px 85px 75px";
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
  const toast = useToast();
  const [gone, setGone] = useState<string[]>([]);
  const list = rows.filter((r) => !gone.includes(r.id));
  const [q, setQ] = useState("");
  const [f, setF] = useState<"all" | "nit" | "out">("all");

  // Two-step delete modal state
  const [target, setTarget] = useState<Reg | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!target || deleting) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const ql = q.trim().toLowerCase();
  const view = list.filter((r) => (!ql || (r.name + r.roll + r.token).toLowerCase().includes(ql)) && (f === "all" || (f === "nit") === r.nit));

  function closeModal() {
    if (deleting) return;
    setTarget(null);
    setConfirmText("");
  }

  async function handleDelete() {
    if (!target) return;
    if (confirmText.trim().toLowerCase() !== "delete") return;

    setDeleting(true);
    try {
      const res = await deleteRegistration(target.id);
      if (!res.ok) return toast(res.error);
      setGone((g) => [...g, target.id]);
      toast(`Deleted registration for ${target.name}`);
      setTarget(null);
      setConfirmText("");
    } catch {
      toast("Could not delete registration");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, roll or token"
          className="min-w-0 flex-[0_1_280px] rounded-lg border-[1.5px] border-fg/30 bg-cream-2 px-3.5 py-[11px] text-[15px] text-fg outline-none focus:border-rust" />
        <Chips opts={[["all", "All"], ["nit", "NIT Delhi"], ["out", "Outside"]]} value={f} set={setF} />
        <span className="ml-auto font-bold">{view.length} of {list.length} shown</span>
      </div>

      <div className="overflow-x-auto rounded-[10px] border border-fg/[.18] bg-cream-2">
        <div className="min-w-[960px]">
          <div className="grid items-center gap-3 border-b border-fg/[.18] bg-hdr px-4 py-3" style={{ gridTemplateColumns: COLS }}>
            {["Token", "Name", "Institute", "Roll", "Year", "Branch", "Pass", "Registered", "Action"].map((h) => <span key={h} className={head}>{h}</span>)}
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
              <div className="justify-self-start">
                <button
                  type="button"
                  onClick={() => {
                    setTarget(r);
                    setConfirmText("");
                  }}
                  className="cursor-pointer rounded-md border border-err/35 bg-err/[.04] px-2.5 py-1 text-xs font-bold text-err transition-all hover:border-err hover:bg-err hover:text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {view.length === 0 && <div className="px-4 py-6 text-fg-3">No registrations match.</div>}
        </div>
      </div>

      {/* Two-step delete confirmation modal */}
      {target && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="flex w-full max-w-[480px] flex-col gap-5 rounded-[18px] border border-fg/20 bg-cream p-6 text-fg shadow-[0_20px_60px_rgba(0,0,0,.5)]"
          >
            <div className="flex items-start justify-between border-b border-fg/15 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-err/15 text-err font-bold text-sm">
                  ⚠
                </span>
                <span className="font-display text-xl font-extrabold text-panel">Delete Registration</span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={deleting}
                className="cursor-pointer text-xl font-bold text-fg-3 hover:text-fg disabled:opacity-40"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-[15px]">
              <p className="m-0 text-fg leading-relaxed">
                Are you sure you want to delete the registration for{" "}
                <strong className="text-panel font-extrabold">{target.name}</strong>?
              </p>

              <div className="rounded-lg border border-fg/15 bg-cream-2 p-3 font-mono text-xs flex flex-col gap-1 text-fg-2">
                <div><span className="text-fg-3">Token ID:</span> <strong>{target.token}</strong></div>
                <div><span className="text-fg-3">Roll number:</span> <strong>{target.roll}</strong></div>
                <div><span className="text-fg-3">Institute:</span> {target.inst}</div>
              </div>

              <div className="rounded-lg border border-err/30 bg-err/[.08] p-3 text-xs leading-relaxed text-err font-medium">
                ⚠️ <strong>Warning:</strong> This action cannot be undone. All scans and records associated with this ticket will be permanently deleted.
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="font-mono text-xs uppercase tracking-[.1em] text-fg-3">
                  To confirm, type <strong className="text-err select-all font-mono">delete</strong> in the space below:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type delete to confirm"
                  disabled={deleting}
                  autoFocus
                  className="w-full rounded-lg border-[1.5px] border-fg/30 bg-cream-2 px-3.5 py-2.5 text-[15px] font-mono text-fg outline-none focus:border-err"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-fg/15 pt-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={deleting}
                className="cursor-pointer rounded-full border border-fg/30 bg-transparent px-4 py-2 text-sm font-semibold text-fg hover:bg-fg/[.06] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText.trim().toLowerCase() !== "delete" || deleting}
                className="cursor-pointer rounded-full border border-err bg-err px-5 py-2 text-sm font-bold text-white hover:bg-err/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {deleting ? "Deleting…" : "Delete entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
