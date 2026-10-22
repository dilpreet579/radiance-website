"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { scan } from "./actions";
import type { ScanResult } from "@/lib/scan";

type Ses = { key: string; label: string };
type Cp = { id: string; name: string };
type LogRow = { name: string; token: string; ses: string; time: string; kind: "ok" | "dup" | "bad" };

const BANNER = { ok: "bg-ok text-white", dup: "bg-warn text-bg", bad: "bg-err text-white" } as const;
const DOT = { ok: "#5FBF85", dup: "#E8B45A", bad: "#FF7A66" } as const;
const mono = "font-mono text-xs uppercase tracking-[.14em]";
const clock = (d: Date | string) => new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`min-h-11 cursor-pointer whitespace-nowrap rounded-full border-[1.5px] px-4 text-[15px] font-semibold ${on ? "border-gold bg-gold text-bg" : "border-cream/45 bg-transparent text-cream"}`}>
      {children}
    </button>
  );
}

export default function ScanClient({ email, isSuper, sessions, checkpoints, signOut }: { email: string; isSuper: boolean; sessions: Ses[]; checkpoints: Cp[]; signOut: () => Promise<void> }) {
  const [session, setSession] = useState("");
  const [cp, setCp] = useState("");
  const [manual, setManual] = useState("");
  const [banner, setBanner] = useState<{ kind: LogRow["kind"]; title: string; name: string; token: string; detail: string } | null>(null);
  const [log, setLog] = useState<LogRow[]>([]);
  const [on, setOn] = useState(false);
  const busy = useRef(false);
  const last = useRef({ t: "", at: 0 });
  const ctx = useRef({ session, cp });
  useEffect(() => { ctx.current = { session, cp }; }, [session, cp]);

  const sesLabel = (key: string, cpId: string) => {
    const s = sessions.find((x) => x.key === key)?.label ?? key;
    return key === "walk" ? `${s} · ${checkpoints.find((c) => c.id === cpId)?.name ?? "?"}` : s;
  };

  async function submit(raw: string) {
    if (busy.current) return;
    busy.current = true;
    const { session: s, cp: c } = ctx.current;
    let r: ScanResult;
    try {
      r = await scan(raw, s, c || null);
    } catch {
      r = { status: "error", message: "Network error. Try again or type the token." };
    } finally {
      busy.current = false;
    }
    const ses = sesLabel(s, c), t = clock(new Date());
    let b;
    if (r.status === "ok") b = { kind: "ok" as const, title: "Marked present", name: r.name, token: r.token, detail: `${ses} · ${t}` };
    else if (r.status === "already") b = { kind: "dup" as const, title: "Already marked", name: r.name, token: r.token, detail: `Marked present at ${clock(r.at)} by ${r.by}.` };
    else if (r.status === "ineligible") b = { kind: "bad" as const, title: "Not eligible", name: r.name, token: r.token, detail: r.reason };
    else if (r.status === "notfound") b = { kind: "bad" as const, title: "Token not found", name: "", token: raw.trim() || "(empty)", detail: "No registration matches this token. Check the ID and try again." };
    else b = { kind: "bad" as const, title: "Error", name: "", token: "", detail: r.message };
    setBanner(b);
    setLog((l) => [{ name: b.name || "Unknown token", token: b.token, ses, time: t, kind: b.kind }, ...l].slice(0, 8));
  }

  useEffect(() => {
    if (!on) return;
    let stop: (() => Promise<void>) | undefined;
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      const q = new Html5Qrcode("reader");
      await q.start({ facingMode: "environment" }, { fps: 8, qrbox: 200 }, (text) => {
        const now = Date.now();
        if (text === last.current.t && now - last.current.at < 3000) return; // camera re-reads the same code
        last.current = { t: text, at: now };
        submit(text);
      }, () => {});
      stop = async () => { await q.stop(); q.clear(); };
    })().catch(() => { setOn(false); setBanner({ kind: "bad", title: "Camera unavailable", name: "", token: "", detail: "Allow camera access, or type the token below." }); });
    return () => { stop?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  const ready = !!session && (session !== "walk" || !!cp);
  const corner = "absolute h-9 w-9 border-gold";
  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col border-x border-cream/[.12] bg-bg text-cream">
      <div className="flex items-center justify-between gap-3 border-b border-cream/[.14] bg-ink px-[18px] py-3">
        <div className="flex min-w-0 flex-col">
          <span className="font-display text-xl font-extrabold leading-[1.1]">Radiance Scanner</span>
          <span className="truncate text-[13px] text-muted">{email}</span>
        </div>
        <div className="flex items-center gap-2">
          {isSuper && <Link href="/admin" className="text-sm font-semibold !text-gold">Dashboard</Link>}
          <form action={signOut}><button className="min-h-11 cursor-pointer rounded-full border-[1.5px] border-cream/45 bg-transparent px-[18px] text-sm font-semibold text-cream">Sign out</button></form>
        </div>
      </div>

      {banner && (
        <div className={`sticky top-0 z-10 flex flex-col gap-0.5 px-[18px] py-4 shadow-[0_6px_20px_rgba(0,0,0,.35)] ${BANNER[banner.kind]}`}>
          <span className="font-display text-[28px] font-extrabold leading-[1.05]">{banner.title}</span>
          {banner.name && <span className="text-[19px] font-bold">{banner.name}</span>}
          {banner.token && <span className="font-mono text-sm tracking-[.06em]">{banner.token}</span>}
          <span className="text-[15px]">{banner.detail}</span>
        </div>
      )}

      <div className="flex flex-col gap-5 p-[18px]">
        <div className="flex flex-col gap-2.5">
          <span className={`${mono} text-gold`}>Session</span>
          <div className="flex flex-wrap gap-2">
            {sessions.map((s) => <Chip key={s.key} on={session === s.key} onClick={() => { setSession(s.key); setBanner(null); }}>{s.label.replace(" Workshop", "").replace("Inaugural + Comedy", "Inaugural")}</Chip>)}
          </div>
        </div>
        {session === "walk" && (
          <div className="flex flex-col gap-2.5">
            <span className={`${mono} text-gold`}>Checkpoint · bus boarding</span>
            <div className="flex flex-wrap gap-2">
              {checkpoints.length === 0 && <span className="text-sm text-muted">No checkpoints yet. Add them in the dashboard.</span>}
              {checkpoints.map((c) => <Chip key={c.id} on={cp === c.id} onClick={() => { setCp(c.id); setBanner(null); }}>{c.name}</Chip>)}
            </div>
          </div>
        )}

        <div className="relative grid aspect-[4/3] max-h-60 w-full place-items-center overflow-hidden border border-cream/25 [background:repeating-linear-gradient(135deg,rgba(244,233,217,.08)_0_14px,rgba(244,233,217,.02)_14px_28px)]">
          <div id="reader" className={`absolute inset-0 [&_video]:h-full [&_video]:w-full [&_video]:object-cover ${on ? "" : "hidden"}`} />
          <span className={`${corner} left-[18px] top-[18px] border-l-4 border-t-4`} />
          <span className={`${corner} right-[18px] top-[18px] border-r-4 border-t-4`} />
          <span className={`${corner} bottom-[18px] left-[18px] border-b-4 border-l-4`} />
          <span className={`${corner} bottom-[18px] right-[18px] border-b-4 border-r-4`} />
          {!on && (
            <button type="button" disabled={!ready} onClick={() => setOn(true)}
              className="relative z-[1] min-h-11 cursor-pointer rounded-full bg-gold px-6 text-base font-bold text-bg disabled:cursor-not-allowed disabled:bg-cream/20 disabled:text-muted">
              {ready ? "Start camera" : session === "walk" ? "Pick a checkpoint" : "Pick a session"}
            </button>
          )}
          {on && <button type="button" onClick={() => setOn(false)} className="absolute bottom-2 left-1/2 z-[1] -translate-x-1/2 cursor-pointer rounded-full bg-ink/80 px-4 py-1.5 text-sm font-semibold text-cream">Stop camera</button>}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (ready && manual.trim()) { submit(manual); setManual(""); } }} className="m-0 flex flex-col gap-2.5">
          <label className={`${mono} text-gold`}>Or type the token ID</label>
          <div className="flex gap-2.5">
            <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="RAD26-0007"
              className="min-h-[52px] min-w-0 flex-1 rounded-[10px] border-[1.5px] border-cream/50 bg-cream/[.08] px-4 font-mono text-lg uppercase text-cream outline-none focus:border-gold" />
            <button disabled={!ready} className="min-h-[52px] cursor-pointer rounded-[10px] bg-gold px-[22px] text-base font-bold text-bg disabled:opacity-50">Mark</button>
          </div>
        </form>

        {log.length > 0 && (
          <div className="flex flex-col">
            <span className={`${mono} mb-1.5 text-gold`}>Recent scans</span>
            {log.map((l, i) => (
              <div key={i} className="flex items-center gap-3 border-t border-cream/[.14] py-3">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: DOT[l.kind] }} />
                <span className="flex min-w-0 flex-1 flex-col"><span className="break-words font-bold">{l.name}</span><span className="text-[13px] text-muted">{l.token} · {l.ses}</span></span>
                <span className="whitespace-nowrap font-mono text-[13px] text-muted">{l.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
