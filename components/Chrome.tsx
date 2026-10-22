"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CONTACT, NAV } from "@/lib/content";
import { SponsorLine } from "./ui";
import type { Sponsor } from "@/lib/sponsors";

// Header + footer. Exhibition page swaps to the Halloween palette; /admin gets no chrome.
export default function Chrome({ children, sponsor }: { children: React.ReactNode; sponsor: Sponsor }) {
  const path = usePathname();
  // menu is remembered per path, so navigating closes it without an effect
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === path;
  const setOpen = (fn: (o: boolean) => boolean) => setOpenAt(fn(open) ? path : null);
  if (path.startsWith("/admin")) return <>{children}</>;

  const ex = path === "/exhibition";
  const links = NAV.map(([href, label]) => ({ href, label, on: path === href }));

  return (
    <div className="flex min-h-screen flex-col" style={{ background: ex ? "#0E0A14" : "#2E070B" }}>
      <div className="border-b border-cream/10 bg-ink">
        <div className="wrap flex justify-center py-2">
          <SponsorLine sponsor={sponsor} />
        </div>
      </div>

      <header
        className="sticky top-0 z-50 border-b border-cream/[.14] backdrop-blur-[10px]"
        style={{ background: ex ? "rgba(14,10,20,.92)" : "rgba(46,7,11,.92)" }}
      >
        <div className="wrap flex h-[68px] items-center justify-between gap-6">
          <Link href="/" className="whitespace-nowrap py-2.5 font-display text-[22px] font-extrabold tracking-[-.01em] text-cream hover:text-cream">
            Radiance <span className="text-gold">2026</span>
          </Link>
          <nav className="hidden items-center gap-7 min-[1100px]:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="whitespace-nowrap border-b-2 py-2 text-[15px] font-semibold"
                style={{ color: l.on ? "#F4E9D9" : "#D9C3B0", borderColor: l.on ? (ex ? "#FF7A1A" : "#EBB65B") : "transparent" }}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/register" className="btn btn-gold px-5 py-2.5 text-[15px]">Register</Link>
          </nav>
          <button
            onClick={() => setOpen((o) => !o)}
            className="cursor-pointer rounded-full border-[1.5px] border-cream/40 bg-transparent px-[18px] py-[9px] text-sm font-semibold text-cream min-[1100px]:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
        {open && (
          <div className="flex flex-col border-t border-cream/[.14] px-[clamp(20px,5vw,64px)] pb-5 pt-1 min-[1100px]:hidden">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="border-b border-cream/[.12] py-3.5 text-lg font-semibold" style={{ color: l.on ? "#F4E9D9" : "#D9C3B0" }}>
                {l.label}
              </Link>
            ))}
            <Link href="/register" className="btn btn-gold mt-[18px] px-5 py-3.5 text-base">Register</Link>
          </div>
        )}
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-cream/[.14]" style={{ background: ex ? "#0A0710" : "#1E0407" }}>
        <div className="wrap flex flex-col gap-10 pb-7 pt-[clamp(40px,6vw,72px)]">
          <div className="grid gap-x-12 gap-y-8 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            <div className="flex flex-col gap-3">
              <div className="font-display text-[26px] font-extrabold">Radiance <span className="text-gold">2026</span></div>
              <div className="text-[15px] text-muted">3rd edition of NIT Delhi&apos;s Annual Creative Fest, organized by Clairvoyance, the Photography and Film Club of NIT Delhi.</div>
            </div>
            {/* link rows are padded to a ~42px tap height, so the column has no gap of its own */}
            <div className="flex flex-col">
              <div className="eyebrow mb-1">Pages</div>
              {links.map((l) => <Link key={l.href} href={l.href} className="py-2.5 text-[15px] text-cream hover:text-gold">{l.label}</Link>)}
              <Link href="/register" className="py-2.5 text-[15px] text-cream hover:text-gold">Register</Link>
            </div>
            <div className="flex flex-col">
              <div className="eyebrow mb-1">Contact</div>
              <a href={`mailto:${CONTACT.email}`} className="py-2.5 text-[15px] text-muted hover:text-gold">{CONTACT.email}</a>
              <div className="flex gap-5 text-[15px] font-semibold">
                {CONTACT.socials.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="py-2.5">{name}</a>)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-cream/[.14] pt-[22px] font-mono text-xs uppercase tracking-[.12em] text-muted">
            <SponsorLine sponsor={sponsor} />
            <span>NIT Delhi · 26 Oct – 5 Nov 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
