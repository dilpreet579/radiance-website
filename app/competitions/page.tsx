import PageHeader from "@/components/PageHeader";
import { CAMPUS_COMPS, ONLINE_COMPS } from "@/lib/content";
import { db, hasDb } from "@/lib/db";
import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;
export const metadata = pageMeta("/competitions");

type Comp = { kind: "online" | "campus"; genre: string; title: string; desc: string; prize: string; theme: string; deadline: string; url: string; live: boolean };

// Admin-managed rows win; with an empty table, show the placeholder competitions.
async function load(globalLive: boolean): Promise<Comp[]> {
  if (hasDb()) {
    try {
      const { data } = await db().from("competitions").select("*").order("position");
      if (data?.length) return data.map((r) => ({ ...r, desc: r.description }));
    } catch {}
  }
  const ph = (kind: Comp["kind"]) => (c: (typeof ONLINE_COMPS)[number]): Comp => ({ kind, ...c, theme: "See the competition page", deadline: "3 Nov, 11:59 PM", url: "#", live: globalLive });
  return [...ONLINE_COMPS.map(ph("online")), ...CAMPUS_COMPS.map(ph("campus"))];
}

function Card({ c }: { c: Comp }) {
  const campus = c.kind === "campus";
  const soon = "Announced 26 Oct";
  const live = c.live && !!c.url;
  const rows: [string, string][] = [
    ["Prize", live ? c.prize : soon],
    ["Theme", live ? c.theme || "—" : soon],
    ["Deadline", live ? c.deadline || "—" : soon],
  ];
  const btnBase = "btn px-[22px] py-3.5 text-base";
  const btn = live
    ? `${btnBase} ${campus ? "btn-gold" : "btn-rust"}`
    : `${btnBase} pointer-events-none border-[1.5px] border-dashed ${campus ? "border-cream/45 text-muted" : "border-fg/40 text-fg-3"}`;
  return (
    <div className={`flex flex-col gap-4 rounded-lg p-[clamp(22px,3vw,30px)] ${campus ? "border border-cream/30 bg-ink/35" : "bg-cream text-fg"}`}>
      <span className={`self-start rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[.12em] ${campus ? "border-gold/60 text-gold" : "border-rust/60 text-rust"}`}>{c.genre}</span>
      <div className="font-display text-[28px] font-extrabold leading-[1.05]">{c.title}</div>
      <p className={`m-0 flex-1 text-base ${campus ? "text-soft" : "text-fg-2"}`}>{c.desc}</p>
      <div className={`grid gap-x-[18px] gap-y-2 border-t pt-3.5 text-[15px] [grid-template-columns:auto_1fr] ${campus ? "border-cream/20" : "border-fg/20"}`}>
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <span className={campus ? "text-muted" : "text-fg-3"}>{k}</span>
            <span className="font-bold">{v}</span>
          </div>
        ))}
      </div>
      <a href={live ? c.url : undefined} target={live ? "_blank" : undefined} rel="noreferrer" className={btn}>
        {live ? (campus ? "Open Google Form ↗" : "Go to Unstop ↗") : "Coming soon"}
      </a>
    </div>
  );
}

function Group({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="m-0 font-display text-[clamp(30px,4vw,48px)] font-extrabold leading-none tracking-[-.02em]">{title}</h2>
        <span className="text-base text-muted">{sub}</span>
      </div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">{children}</div>
    </div>
  );
}

export default async function Competitions() {
  const s = await getSettings();
  const comps = await load(s.competitions_live);
  const anyLive = comps.some((c) => c.live && c.url);
  return (
    <>
      <PageHeader path="/competitions" />
      <main className="bg-panel pb-[clamp(56px,8vw,112px)] pt-[clamp(40px,6vw,80px)]">
        <div className="wrap flex flex-col gap-[clamp(40px,6vw,72px)]">
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2 rounded-lg border border-gold/60 bg-gold/[.08] px-[22px] py-4">
            <span className="eyebrow">{anyLive ? "Live now" : "Coming soon"}</span>
            <span className="text-base">
              {anyLive ? "Competition links are live. Submit your entries before the deadlines." : "Competitions go live on 26 Oct, the inaugural day. Links and details appear here."}
            </span>
          </div>
          <Group title="Online on Unstop" sub="All-India · free · open to all students">
            {comps.filter((c) => c.kind === "online").map((c) => <Card key={c.title} c={c} />)}
          </Group>
          <Group title="In-campus" sub="NIT Delhi students only · submissions via Google Forms">
            {comps.filter((c) => c.kind === "campus").map((c) => <Card key={c.title} c={c} />)}
          </Group>
        </div>
      </main>
    </>
  );
}
