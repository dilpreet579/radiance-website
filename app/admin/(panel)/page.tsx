import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getSettings, seatsTaken } from "@/lib/settings";
import { WORKSHOP_OPTIONS } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAdmin("super");
  const sb = db();
  const [{ data: regs }, { data: sessions }, { data: scans }, taken, s] = await Promise.all([
    sb.from("registrations").select("is_nit"),
    sb.from("sessions").select("key,label").order("position"),
    sb.from("scans").select("session_key"),
    seatsTaken(),
    getSettings(),
  ]);
  const nit = (regs ?? []).filter((r) => r.is_nit).length;
  const count = (k: string) => (scans ?? []).filter((x) => x.session_key === k).length;
  const card = "rounded-xl bg-cream-2 p-5 border border-fg/10";
  return (
    <div className="flex flex-col gap-8">
      <p className="m-0 text-sm text-fg-3">Refresh the page to see the latest numbers.</p>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        {[["Registrations", (regs ?? []).length], ["NIT Delhi (Universal)", nit], ["Outside (Workshop)", (regs ?? []).length - nit]].map(([l, v]) => (
          <div key={l} className={card}><div className="font-display text-5xl font-extrabold text-rust">{v}</div><div className="font-semibold">{l}</div></div>
        ))}
      </div>
      <section>
        <h2 className="mb-3 font-display text-2xl font-extrabold">Attendance per session</h2>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {(sessions ?? []).map((x) => (
            <div key={x.key} className={card + " flex items-center justify-between gap-3"}>
              <div><div className="font-semibold">{x.label}</div><a className="text-sm !text-rust" href={`/admin/export?type=attendance&session=${x.key}`}>Download CSV</a></div>
              <div className="font-display text-3xl font-extrabold">{count(x.key)}</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-display text-2xl font-extrabold">Outside seats used</h2>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {WORKSHOP_OPTIONS.map((w) => (
            <div key={w.key} className={card}><div className="font-semibold">{w.name}</div><div className="font-display text-3xl font-extrabold">{taken[w.key] ?? 0} / {s.seat_cap}</div></div>
          ))}
        </div>
      </section>
      <section className="flex flex-wrap gap-3">
        {[["registrations", "All registrations"], ["leaderboard", "Leaderboard"], ["shortlist", "Photo walk shortlist"]].map(([t, l]) => (
          <a key={t} href={`/admin/export?type=${t}`} className="btn btn-rust px-5 py-2.5 text-sm">{l} CSV</a>
        ))}
        <a href="/admin/export?type=attendance&session=film" className="btn btn-rust px-5 py-2.5 text-sm">Filmmaking attendees CSV</a>
      </section>
    </div>
  );
}
