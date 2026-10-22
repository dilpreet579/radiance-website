import { db } from "@/lib/db";
import { getSettings, seatsTaken } from "@/lib/settings";
import { WORKSHOP_OPTIONS } from "@/lib/content";
import { Bar, Card, PageTitle, btnP, btnS, monoHead } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const dl = (type: string, session?: string) => `/admin/export?type=${type}${session ? `&session=${session}` : ""}`;

export default async function Overview() {
  const sb = db();
  const [{ data: regs }, { data: scans }, { data: cps }, taken, s] = await Promise.all([
    sb.from("registrations").select("is_nit,workshops,walk_selected"),
    sb.from("scans").select("session_key,scanned_at").order("scanned_at", { ascending: false }),
    sb.from("checkpoints").select("id"),
    seatsTaken(),
    getSettings(),
  ]);
  const all = regs ?? [], nit = all.filter((r) => r.is_nit), out = all.filter((r) => !r.is_nit);
  const cnt = (k: string) => (scans ?? []).filter((x) => x.session_key === k).length;
  const eligible = (k: string) => nit.length + out.filter((r) => r.workshops.includes(k)).length;
  const bars = [
    ["Inaugural", "inaugural", nit.length],
    ["Photography", "photo", eligible("photo")],
    ["Filmmaking", "film", eligible("film")],
    ["Motion Design", "motion", eligible("motion")],
    ["Graphic Design", "graphic", eligible("graphic")],
    ["Exhibition", "exhibition", all.length],
  ] as const;
  const walkSel = nit.filter((r) => r.walk_selected).length;
  const boarded = cnt("walk");
  const last = scans?.[0]?.scanned_at;
  const stats: [string, number][] = [["Registrations", all.length], ["NIT Delhi · Universal Pass", nit.length], ["Outside · Workshop Pass", out.length], ["Scans recorded", scans?.length ?? 0]];

  return (
    <>
      <PageTitle title="Overview" sub="Counts update from the latest scans. Refresh to see the newest numbers."
        actions={<>
          <a href="/admin" className={btnS}>Refresh</a>
          <a href={dl("registrations")} className={btnS}>Registrations CSV</a>
          <a href={dl("attendance", "inaugural")} className={btnS}>Inaugural attendance CSV</a>
          <a href={dl("attendance", "film")} className={btnS}>Filmmaking attendees CSV</a>
          <a href={dl("shortlist")} className={btnP}>Shortlist CSV</a>
        </>} />
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        {stats.map(([l, n]) => (
          <Card key={l} className="!gap-1"><span className="font-display text-5xl font-extrabold leading-none tracking-[-.02em] text-rust">{n}</span><span className="text-[15px] font-semibold text-fg-2">{l}</span></Card>
        ))}
      </div>
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
        <Card className="!gap-4 !p-[22px]">
          <span className={monoHead}>Attendance per session</span>
          {bars.map(([l, k, d]) => <Bar key={k} label={l} count={`${cnt(k)} / ${d}`} pct={d ? (cnt(k) / d) * 100 : 0} />)}
          <Bar label="Photo walk (all checkpoints)" count={`${boarded} boarded`} pct={(boarded / Math.max(1, walkSel * Math.max(1, cps?.length ?? 0))) * 100} />
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-fg/15 pt-3 text-sm">
            {[...bars.map(([l, k]) => [l, k] as const), ["Photo walk", "walk"] as const].map(([l, k]) => <a key={k} href={dl("attendance", k)}>{l} CSV</a>)}
          </div>
        </Card>
        <Card className="!gap-4 !self-start !p-[22px]">
          <span className={monoHead}>Outside seats used per workshop</span>
          {WORKSHOP_OPTIONS.map((w) => {
            const t = taken[w.key] ?? 0;
            return <Bar key={w.key} label={w.name} count={`${t} / ${s.seat_cap}`} pct={s.seat_cap ? (t / s.seat_cap) * 100 : 0} color={t >= s.seat_cap ? "#A4210F" : "#A82E17"} />;
          })}
          <span className="border-t border-fg/15 pt-3 text-sm text-fg-3">
            {last ? `Last scan at ${new Date(last).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}. Refresh to see the latest numbers.` : "No scans yet."}
          </span>
        </Card>
      </div>
    </>
  );
}
