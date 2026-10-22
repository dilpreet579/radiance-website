import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin, authClient } from "@/lib/auth";

const LINKS = [
  ["/admin", "Dashboard"],
  ["/admin/scan", "Scan"],
  ["/admin/registrations", "Registrations"],
  ["/admin/leaderboard", "Leaderboard"],
  ["/admin/competitions", "Competitions"],
  ["/admin/checkpoints", "Checkpoints"],
  ["/admin/reminders", "Reminders"],
  ["/admin/sponsors", "Sponsors"],
  ["/admin/settings", "Settings"],
] as const;

async function logout() {
  "use server";
  await (await authClient()).auth.signOut();
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  const links = a.role === "super" ? LINKS : LINKS.filter(([h]) => h === "/admin/scan");
  return (
    <div className="min-h-screen bg-cream text-fg">
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-bg px-5 py-3 text-sm font-semibold text-cream">
        <span className="font-display text-lg font-extrabold">Radiance <span className="text-gold">admin</span></span>
        {links.map(([h, l]) => <Link key={h} href={h} className="text-cream hover:text-gold">{l}</Link>)}
        <span className="ml-auto text-muted">{a.email} · {a.role}</span>
        <form action={logout}><button className="cursor-pointer rounded-full border border-cream/40 bg-transparent px-3 py-1 text-cream">Sign out</button></form>
      </nav>
      <div className="mx-auto max-w-[1200px] p-5">{children}</div>
    </div>
  );
}
