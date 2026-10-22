"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { register, type RegInput, type Ticket } from "./actions";
import { WORKSHOP_OPTIONS } from "@/lib/content";
import type { Settings } from "@/lib/settings";
import { LogoSlot } from "@/components/ui";

const EMPTY: Omit<RegInput, "nit" | "workshops" | "consents"> & { inst: string } = {
  name: "", gender: "", inst: "NIT Delhi", instName: "", roll: "", year: "", branch: "", phone: "", email: "",
};

const label = "font-mono text-xs uppercase tracking-[.12em] text-fg-3";
const errCls = "text-sm font-semibold text-err";

export default function RegisterForm({ seatsLeft, seatCap, consents }: { seatsLeft: Record<string, number>; seatCap: number; consents: Settings["consents"] }) {
  const [f, setF] = useState(EMPTY);
  const [ws, setWs] = useState<string[]>([]);
  const [cons, setCons] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ ticket: Ticket; dup: boolean; emailed: boolean } | null>(null);
  const [pending, start] = useTransition();
  const nit = f.inst === "NIT Delhi";
  const clear = (k: string) => setErr((e) => ({ ...e, [k]: "" }));
  const set = (k: keyof typeof EMPTY, v: string) => { setF((s) => ({ ...s, [k]: v })); clear(k); };

  function pickInst(v: string) { set("inst", v); setWs([]); setCons({}); setErr({}); }

  function submit() {
    start(async () => {
      const r = await register({ ...f, nit, workshops: ws, consents: cons });
      if (r.ok) { setDone(r); window.scrollTo(0, 0); } else setErr(r.errors);
    });
  }

  if (done) return <TicketView {...done} again={() => { setDone(null); setF(EMPTY); setWs([]); setCons({}); setErr({}); }} />;

  // plain render functions (not components) so inputs keep focus across re-renders
  const chips = (k: keyof typeof EMPTY, opts: string[]) => (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => {
        const on = f[k] === o;
        return (
          <button key={o} type="button" onClick={() => (k === "inst" ? pickInst(o) : set(k, o))}
            className={`cursor-pointer rounded-full border-[1.5px] px-[18px] py-[9px] text-[15px] font-semibold ${on ? "border-panel bg-panel text-cream" : "border-fg/30 bg-transparent text-fg"}`}>
            {o}
          </button>
        );
      })}
    </div>
  );
  const field = (k: string, text: string, o: { type?: string; hint?: string; wide?: boolean; children?: React.ReactNode } = {}) => {
    const { type = "text", hint, wide, children } = o;
    return (
    <div key={k} className={`flex min-w-0 flex-col gap-2 ${wide ? "col-span-full" : ""}`}>
      <label className={label}>{text}</label>
      {children ?? (
        <input type={type} value={f[k as keyof typeof EMPTY]} onChange={(e) => set(k as keyof typeof EMPTY, e.target.value)}
          className={`w-full rounded-lg border-[1.5px] bg-cream-2 px-3.5 py-[13px] text-base text-fg outline-none focus:border-rust ${err[k] ? "border-err" : "border-fg/30"}`} />
      )}
      {hint && !err[k] && <span className="text-sm text-fg-3">{hint}</span>}
      {err[k] && <span className={errCls}>{err[k]}</span>}
    </div>
    );
  };

  const list = nit ? consents.nit : consents.outside;
  const passIn = nit ? ["Inaugural ceremony and stand-up comedy", "All four workshops", "Photo walk, if selected", "Grand Exhibition, 4 and 5 Nov"] : [`The workshops you select, ${seatCap} outside seats per workshop`, "Grand Exhibition on 4 Nov, open to everyone"];
  const passOut = nit ? [] : ["Inaugural ceremony and comedy show", "Photo walk"];

  return (
    <div className="flex flex-wrap items-start gap-[clamp(24px,4vw,48px)]">
      <div className="flex min-w-0 basis-[520px] flex-1 flex-col gap-[26px] rounded-[10px] bg-cream p-[clamp(22px,3.4vw,44px)] text-fg">
        <div className="grid gap-x-5 gap-y-[22px] [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {field("name", "Full name")}
          {field("email", "Email ID", { type: "email", hint: nit ? "NIT Delhi emails end with @nitdelhi.ac.in" : "" })}
          {field("phone", "Phone number", { type: "tel" })}
          {field("roll", "Roll number", { hint: nit ? "NIT Delhi roll numbers start with 2" : "" })}
          {field("gender", "Gender", { wide: true, children: chips("gender", ["Male", "Female", "Other", "Prefer not to say"]) })}
          {field("inst", "Institute", { wide: true, children: chips("inst", ["NIT Delhi", "Other"]) })}
          {!nit && field("instName", "Institute name", { wide: true })}
          {field("year", "Year", { wide: true, children: chips("year", ["1st", "2nd", "3rd", "4th", "Other"]) })}
          {field("branch", "Branch", { wide: true })}
        </div>

        {!nit && (
          <div className="flex flex-col gap-2.5 border-t border-fg/[.18] pt-6">
            <label className={label}>Workshops · select one or more</label>
            {WORKSHOP_OPTIONS.map((w) => {
              const left = seatsLeft[w.key] ?? seatCap, full = left <= 0, on = ws.includes(w.key);
              return (
                <div key={w.key} onClick={() => { if (full) return; setWs(on ? ws.filter((x) => x !== w.key) : [...ws, w.key]); clear("ws"); }}
                  className={`flex items-center gap-3.5 rounded-lg border-[1.5px] p-3.5 ${on ? "border-panel" : "border-fg/20"} ${full ? "cursor-not-allowed bg-fg/[.06] opacity-65" : "cursor-pointer bg-cream-2"}`}>
                  <Box on={on} />
                  <span className="flex flex-1 flex-col"><span className="text-[17px] font-bold">{w.name}</span><span className="text-sm text-fg-3">{w.d}</span></span>
                  <span className={`whitespace-nowrap font-mono text-xs uppercase tracking-[.08em] ${full ? "font-bold text-err" : "text-fg-3"}`}>{full ? "Seats full" : `${left} seats left`}</span>
                </div>
              );
            })}
            {err.ws && <span className={errCls}>{err.ws}</span>}
          </div>
        )}

        <div className="flex flex-col gap-2.5 border-t border-fg/[.18] pt-6">
          <label className={label}>Undertakings</label>
          {list.map((c) => (
            <div key={c.key} onClick={() => { setCons((s) => ({ ...s, [c.key]: !s[c.key] })); clear("consent"); }}
              className="flex cursor-pointer items-start gap-3.5 rounded-lg border-[1.5px] border-fg/20 bg-cream-2 p-3.5 hover:border-rust">
              <Box on={!!cons[c.key]} className="mt-0.5" />
              <span className="flex flex-col gap-0.5"><span className="text-base font-bold">{c.t}</span><span className="text-sm text-fg-2">{c.d}</span></span>
            </div>
          ))}
          {err.consent && <span className={errCls}>{err.consent}</span>}
        </div>

        {err.form && <span className={errCls}>{err.form}</span>}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <button onClick={submit} disabled={pending} className="btn btn-rust px-[34px] py-4 text-[17px] disabled:opacity-60">
            {pending ? "Registering…" : "Register and get ticket →"}
          </button>
          <span className="basis-[220px] flex-1 text-sm text-fg-3">No identity check on the website. NIT Delhi students are verified at the venue.</span>
        </div>
      </div>

      <aside className="flex max-w-[420px] basis-[300px] flex-1 flex-col gap-[18px] rounded-[10px] border border-cream/25 bg-ink/35 p-[clamp(22px,3vw,32px)]">
        <div className="eyebrow">Your pass</div>
        <div className="font-display text-4xl font-extrabold leading-none">{nit ? "Universal Pass" : "Workshop Pass"}</div>
        <div className="text-[15px] text-muted">{nit ? "For NIT Delhi students. One registration, one ticket." : "For students of other institutes. Free of charge."}</div>
        <div className="flex flex-col gap-2.5 border-t border-cream/20 pt-4">
          {passIn.map((p) => <div key={p} className="flex gap-3 text-base"><span className="text-gold">✓</span><span>{p}</span></div>)}
          {passOut.map((p) => <div key={p} className="flex gap-3 text-base text-muted"><span>✕</span><span>{p}</span></div>)}
        </div>
      </aside>
    </div>
  );
}

function Box({ on, className = "" }: { on: boolean; className?: string }) {
  return <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-[5px] border-[1.5px] border-panel text-[15px] font-bold text-cream ${on ? "bg-panel" : ""} ${className}`}>{on ? "✓" : ""}</span>;
}

function TicketView({ ticket: t, dup, emailed, again }: { ticket: Ticket; dup: boolean; emailed: boolean; again: () => void }) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-[clamp(28px,5vw,72px)]">
      <div className="w-full basis-[380px] overflow-hidden rounded-[18px] bg-cream text-fg shadow-[12px_12px_0_#1E0407] sm:max-w-[380px]">
        <div className="pattern-bg px-[18px] py-4">
          <div className="rounded-md bg-cream px-2.5 py-1">
            <div className="aspect-[2172/510] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/radiance26-logo.png" alt="Radiance 2026" className="-mt-[3.2%] block w-full" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 px-[26px] pb-5 pt-[22px]">
          <div className="flex items-center justify-between gap-2.5">
            <span className={label + " tracking-[.14em]"}>Entry ticket</span>
            <span className="rounded-full bg-rust px-3 py-1 font-mono text-[11px] uppercase tracking-[.12em] text-cream">{t.type}</span>
          </div>
          <div className="break-words font-display text-[32px] font-extrabold leading-[1.05] tracking-[-.01em]">{t.name}</div>
          <div className="text-[15px] text-fg-2">{t.institute} · {t.roll}</div>
        </div>
        <div className="relative mx-3.5 border-t-2 border-dashed border-fg/30">
          <span className="absolute -left-[26px] -top-[13px] h-6 w-6 rounded-full bg-panel" />
          <span className="absolute -right-[26px] -top-[13px] h-6 w-6 rounded-full bg-panel" />
        </div>
        <div className="flex flex-wrap items-center gap-5 px-[26px] py-[22px]">
          <div className="h-36 w-36 rounded-lg border-[1.5px] border-fg/20 bg-cream-2 p-2">
            <svg viewBox={`0 0 ${t.qrBox} ${t.qrBox}`} width="100%" height="100%" shapeRendering="crispEdges" className="block"><path d={t.qrPath} fill="#2A0B0C" /></svg>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className={label + " tracking-[.14em]"}>Token ID</span>
            <span className="font-mono text-2xl font-medium tracking-[.04em]">{t.token}</span>
            <span className="text-[13px] text-fg-3">Show at every event</span>
          </div>
        </div>
        {t.workshops.length > 0 && (
          <div className="flex flex-col gap-2 px-[26px] pb-[22px]">
            <span className={label + " tracking-[.14em]"}>Workshops</span>
            <div className="flex flex-wrap gap-2">{t.workshops.map((w) => <span key={w} className="rounded-full border-[1.5px] border-fg/30 px-3.5 py-[5px] text-sm font-semibold">{w}</span>)}</div>
          </div>
        )}
        <div className="flex items-center gap-3 bg-bg px-[26px] py-3 font-mono text-[11px] uppercase tracking-[.12em] text-cream">
          <span>Title Sponsor</span><LogoSlot w={44} h={18} logo={t.sponsor.logo_url} /><span>{t.sponsor.name}</span>
        </div>
      </div>
      <div className="flex max-w-[520px] basis-80 flex-1 flex-col gap-[22px]">
        <div className="font-mono text-[13px] uppercase tracking-[.14em] text-gold">{dup ? "Already registered" : "Registration complete"}</div>
        <h2 className="m-0 font-display text-[clamp(36px,5vw,64px)] font-extrabold leading-none tracking-[-.02em]">{dup ? "Your ticket is below" : "You are registered"}</h2>
        <p className="m-0 text-pretty text-[19px]">
          {dup ? "You have already registered with these details. " : ""}
          {emailed ? `Your ticket has been ${dup ? "sent again" : "emailed"} to ${t.email}.` : "We could not send the email just now, so please screenshot this ticket."}
        </p>
        <div className="rounded-lg border border-gold/60 bg-gold/[.08] px-5 py-4 text-base">Take a screenshot of this ticket or keep the email handy; you&apos;ll need to show the QR / token at every event.</div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="btn btn-gold px-[26px] py-3.5 text-base">Back to home</Link>
          <button onClick={again} className="btn btn-ghost bg-transparent px-[26px] py-3.5 text-base">Register someone else</button>
        </div>
      </div>
    </div>
  );
}
