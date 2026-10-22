import PageHeader from "@/components/PageHeader";
import { CAMPUS_COMPS, ONLINE_COMPS } from "@/lib/content";

// Flip to true on 26 Oct. Moves to an admin toggle + DB table (links, deadlines) in the admin phase.
const LIVE = process.env.NEXT_PUBLIC_COMPETITIONS_LIVE === "true";

type Comp = (typeof ONLINE_COMPS)[number];

function Card({ c, campus, label }: { c: Comp; campus?: boolean; label: string }) {
  const soon = "Announced 26 Oct";
  const rows: [string, string][] = [
    ["Prize", LIVE ? c.prize : soon],
    ["Theme", LIVE ? "See the competition page" : soon],
    ["Deadline", LIVE ? "3 Nov, 11:59 PM" : soon],
  ];
  const btnBase = "btn px-[22px] py-3.5 text-base";
  const btn = LIVE
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
      {/* ponytail: link is "#" until admin-editable URLs land in the DB phase */}
      <a href={LIVE ? "#" : undefined} className={btn}>{LIVE ? label : "Coming soon"}</a>
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

export default function Competitions() {
  return (
    <>
      <PageHeader path="/competitions" />
      <main className="bg-panel pb-[clamp(56px,8vw,112px)] pt-[clamp(40px,6vw,80px)]">
        <div className="wrap flex flex-col gap-[clamp(40px,6vw,72px)]">
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2 rounded-lg border border-gold/60 bg-gold/[.08] px-[22px] py-4">
            <span className="eyebrow">{LIVE ? "Live now" : "Coming soon"}</span>
            <span className="text-base">
              {LIVE ? "Competition links are live. Submit your entries before the deadlines." : "Competitions go live on 26 Oct, the inaugural day. Links and details appear here."}
            </span>
          </div>
          <Group title="Online on Unstop" sub="All-India · free · open to all students">
            {ONLINE_COMPS.map((c) => <Card key={c.title} c={c} label="Go to Unstop ↗" />)}
          </Group>
          <Group title="In-campus" sub="NIT Delhi students only · submissions via Google Forms">
            {CAMPUS_COMPS.map((c) => <Card key={c.title} c={c} campus label="Open Google Form ↗" />)}
          </Group>
        </div>
      </main>
    </>
  );
}
