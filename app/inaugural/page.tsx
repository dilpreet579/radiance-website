import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { INAUG_FACTS, INAUG_STEPS } from "@/lib/content";

export default function Inaugural() {
  return (
    <>
      <PageHeader path="/inaugural" />
      <main className="bg-panel pb-[clamp(56px,8vw,112px)] pt-[clamp(40px,6vw,80px)]">
        <div className="wrap grid items-start gap-[clamp(32px,5vw,72px)] [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          <div className="flex flex-col gap-[clamp(32px,4vw,48px)]">
            <div>
              <div className="eyebrow mb-2">What happens</div>
              {INAUG_STEPS.map((s) => (
                <div key={s.n} className="flex gap-[22px] border-t border-cream/20 py-[22px]">
                  <span className="basis-14 font-display text-[40px] font-extrabold leading-none text-gold">{s.n}</span>
                  <div>
                    <div className="font-display text-[26px] font-bold leading-[1.15]">{s.t}</div>
                    <div className="mt-1 text-muted">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-6 rounded-lg border border-cream/25 bg-ink/35 p-5">
              <div className="placeholder grid aspect-[3/4] basis-[150px] place-items-center p-2 text-center font-mono text-[11px] uppercase tracking-[.1em]">Vaibhav Kant<br />placeholder photo</div>
              <div className="flex basis-[220px] flex-1 flex-col gap-2">
                <div className="eyebrow">Stand-up comedy</div>
                <div className="font-display text-[32px] font-extrabold leading-[1.05]">Vaibhav Kant</div>
                <p className="m-0 text-base text-soft">Short bio to be added. The comedy show is for NIT Delhi students only, and the show guidelines are accepted at registration.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col rounded-lg border border-cream/25 bg-ink/35 p-[clamp(20px,3vw,32px)]">
            <div className="eyebrow mb-2">Details</div>
            {INAUG_FACTS.map((f) => (
              <div key={f.k} className="flex flex-wrap justify-between gap-x-5 gap-y-1 border-t border-cream/[.16] py-3.5">
                <span className="text-[15px] text-muted">{f.k}</span>
                <span className="text-right font-semibold">{f.v}</span>
              </div>
            ))}
            <Link href="/register" className="btn btn-gold mt-[22px] px-[26px] py-[15px] text-base">Register with your Universal Pass <span>→</span></Link>
          </div>
        </div>
      </main>
    </>
  );
}
