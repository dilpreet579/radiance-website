"use client";

import { useEffect, useRef, useState } from "react";
import { scan } from "./actions";
import type { ScanResult } from "@/lib/scan";

type Opt = { key?: string; id?: string; label?: string; name?: string };
// sessions come as {key,label}, checkpoints as {id,name}

const COLORS = { ok: "bg-green-700", already: "bg-amber-600", ineligible: "bg-red-700", notfound: "bg-red-700", error: "bg-red-700" } as const;

export default function ScanClient({ sessions, checkpoints }: { sessions: Opt[]; checkpoints: Opt[] }) {
  const [session, setSession] = useState("");
  const [cp, setCp] = useState("");
  const [manual, setManual] = useState("");
  const [res, setRes] = useState<ScanResult | null>(null);
  const [on, setOn] = useState(false);
  const busy = useRef(false);
  const last = useRef({ t: "", at: 0 });
  const ctx = useRef({ session, cp });
  useEffect(() => { ctx.current = { session, cp }; }, [session, cp]);

  async function submit(token: string) {
    if (busy.current) return;
    busy.current = true;
    try {
      setRes(await scan(token, ctx.current.session, ctx.current.cp || null));
    } catch {
      setRes({ status: "error", message: "Network error. Try again or type the token." });
    } finally {
      busy.current = false;
    }
  }

  useEffect(() => {
    if (!on) return;
    let stop: (() => Promise<void>) | undefined;
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      const q = new Html5Qrcode("reader");
      await q.start({ facingMode: "environment" }, { fps: 8, qrbox: 240 }, (text) => {
        const now = Date.now();
        if (text === last.current.t && now - last.current.at < 3000) return; // camera re-reads the same code
        last.current = { t: text, at: now };
        submit(text);
      }, () => {});
      stop = async () => { await q.stop(); q.clear(); };
    })().catch(() => { setOn(false); setRes({ status: "error", message: "Camera unavailable. Allow camera access or type the token." }); });
    return () => { stop?.(); };
  }, [on]);

  const needCp = session === "walk";
  const ready = session && (!needCp || cp);
  const sel = "w-full rounded-lg border-[1.5px] border-fg/30 bg-cream-2 px-3 py-3 text-base";
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <select className={sel} value={session} onChange={(e) => setSession(e.target.value)}>
        <option value="">Select session…</option>
        {sessions.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>
      {needCp && (
        <select className={sel} value={cp} onChange={(e) => setCp(e.target.value)}>
          <option value="">Select checkpoint…</option>
          {checkpoints.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
      <button disabled={!ready} onClick={() => setOn((v) => !v)} className="btn btn-rust py-3.5 text-base disabled:opacity-50">
        {on ? "Stop camera" : "Start camera"}
      </button>
      <div id="reader" className={on ? "overflow-hidden rounded-lg" : "hidden"} />
      <form onSubmit={(e) => { e.preventDefault(); if (ready && manual.trim()) { submit(manual); setManual(""); } }} className="flex gap-2">
        <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Type token (RAD26-0042 or 42)" className={sel} />
        <button disabled={!ready} className="btn btn-gold px-5 disabled:opacity-50">Mark</button>
      </form>
      {res && (
        <div className={`rounded-xl p-5 text-center text-cream ${COLORS[res.status]}`}>
          <div className="font-display text-2xl font-extrabold">
            {res.status === "ok" && "Present ✓"}
            {res.status === "already" && "Already marked"}
            {res.status === "ineligible" && "Not eligible"}
            {res.status === "notfound" && "Not found"}
            {res.status === "error" && "Error"}
          </div>
          {"name" in res && <div className="mt-1 text-lg font-semibold">{res.name} · <span className="font-mono">{res.token}</span></div>}
          {"reason" in res && <div className="mt-1">{res.reason}</div>}
          {"message" in res && <div className="mt-1">{res.message}</div>}
          {"at" in res && res.status === "already" && <div className="mt-1 text-sm">First scanned {new Date(res.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>}
        </div>
      )}
    </div>
  );
}
