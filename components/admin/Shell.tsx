"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToastProvider } from "./Toast";

const NAV = [
  ["/admin", "Overview"],
  ["/admin/registrations", "Registrations"],
  ["/admin/leaderboard", "Leaderboard"],
  ["/admin/competitions", "Competitions"],
  ["/admin/checkpoints", "Checkpoints"],
  ["/admin/reminders", "Reminder emails"],
  ["/admin/sponsors", "Sponsors"],
  ["/admin/settings", "Settings"],
] as const;

export default function Shell({ signOut, children }: { signOut: () => Promise<void>; children: React.ReactNode }) {
  const path = usePathname();
  const on = (h: string) => path === h;
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-cream text-fg">
        <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between gap-4 bg-bg px-[clamp(16px,3vw,28px)] text-cream">
          <span className="whitespace-nowrap font-display text-xl font-extrabold">Radiance <span className="text-gold">Admin</span></span>
          <div className="flex items-center gap-[18px] text-sm">
            <Link href="/admin/scan" className="whitespace-nowrap font-semibold !text-gold hover:!text-cream">Scanner</Link>
            <Link href="/" className="whitespace-nowrap font-semibold !text-gold hover:!text-cream">Public site ↗</Link>
            <form action={signOut}><button className="cursor-pointer whitespace-nowrap rounded-full border-[1.5px] border-cream/45 bg-transparent px-4 py-[7px] text-sm font-semibold text-cream">Sign out</button></form>
          </div>
        </div>
        <div className="flex min-h-0 flex-1">
          <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] flex-[0_0_220px] flex-col gap-1 self-start bg-panel px-3 py-5 min-[900px]:flex">
            {NAV.map(([h, l]) => (
              <Link key={h} href={h} className={`rounded-lg px-3.5 py-[11px] text-[15px] font-semibold ${on(h) ? "bg-cream !text-bg" : "!text-soft hover:bg-cream/10"}`}>{l}</Link>
            ))}
          </aside>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex gap-2 overflow-x-auto bg-panel px-[clamp(16px,3vw,28px)] py-3 min-[900px]:hidden">
              {NAV.map(([h, l]) => (
                <Link key={h} href={h} className={`whitespace-nowrap rounded-full border-[1.5px] px-4 py-2 text-sm font-semibold ${on(h) ? "border-cream bg-cream !text-bg" : "border-cream/40 !text-cream"}`}>{l}</Link>
              ))}
            </div>
            <main className="flex w-full max-w-[1400px] flex-col gap-6 px-[clamp(16px,3vw,40px)] pb-20 pt-[clamp(20px,3vw,40px)]">{children}</main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
