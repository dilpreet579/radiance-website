import PageHeader from "@/components/PageHeader";
import { WALK_INFO, WALK_SESSIONS } from "@/lib/content";

export default function PhotoWalk() {
  return (
    <>
      <PageHeader path="/photowalk" />
      <main className="bg-panel pb-[clamp(56px,8vw,112px)] pt-[clamp(40px,6vw,80px)]">
        <div className="wrap flex flex-col gap-[clamp(40px,6vw,72px)]">
          <div className="grid items-center gap-[clamp(28px,5vw,72px)] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            <div className="flex items-baseline gap-[18px]">
              <span className="font-display text-[clamp(120px,20vw,240px)] font-extrabold leading-[.85] tracking-[-.05em] text-gold">90</span>
              <span className="font-display text-[clamp(22px,2.6vw,30px)] font-bold leading-[1.15]">NIT Delhi students selected</span>
            </div>
            <div className="flex flex-col gap-3.5">
              <div className="eyebrow">How selection works</div>
              <p className="m-0 text-pretty text-[19px]">Selection is based on attendance across the Inaugural and all four workshops. Higher attendance ranks higher. Ties are broken by engagement with the speakers.</p>
            </div>
          </div>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
            {WALK_SESSIONS.map((s) => (
              <div key={s.n} className="flex flex-col gap-1.5 rounded-lg border border-cream/25 bg-ink/35 p-[18px]">
                <span className="font-mono text-xs tracking-[.12em] text-gold">{s.n} / 05</span>
                <span className="font-display text-[22px] font-bold leading-[1.1]">{s.t}</span>
                <span className="text-sm text-muted">{s.d}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {WALK_INFO.map((i) => (
              <div key={i.k} className="flex flex-col gap-2 rounded-lg bg-cream p-[clamp(22px,3vw,30px)] text-fg">
                <span className="eyebrow !text-rust">{i.k}</span>
                <span className="font-display text-[28px] font-extrabold leading-[1.05]">{i.v}</span>
                <span className="text-[15px] text-fg-2">{i.d}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
