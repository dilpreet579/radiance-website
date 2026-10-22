import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { INAUG_FACTS, INAUG_STEPS } from "@/lib/content";
import { pageMeta } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;
export const metadata = pageMeta("/inaugural");

export default async function Inaugural() {
  const { venue } = await getSettings();
  const facts = INAUG_FACTS.map((f) => (f.k === "Venue" ? { ...f, v: venue } : f));
  return (
    <>
      <PageHeader path="/inaugural" />
      <main className="bg-panel pb-[clamp(56px,8vw,112px)] pt-[clamp(40px,6vw,80px)]">
        <div className="wrap flex flex-col gap-[clamp(36px,5vw,60px)]">
          <div className="grid items-start gap-[clamp(32px,5vw,72px)] [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
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

            <div className="flex flex-col rounded-lg border border-cream/25 bg-ink/35 p-[clamp(20px,3vw,32px)]">
              <div className="eyebrow mb-2">Details</div>
              {facts.map((f) => (
                <div key={f.k} className="flex flex-wrap justify-between gap-x-5 gap-y-1 border-t border-cream/[.16] py-3.5">
                  <span className="text-[15px] text-muted">{f.k}</span>
                  <span className="text-right font-semibold">{f.v}</span>
                </div>
              ))}
              <Link href="/register" className="btn btn-gold mt-[22px] px-[26px] py-[15px] text-base">Register with your Universal Pass <span>→</span></Link>
            </div>
          </div>

          {/* Stand-up comedy full-width feature block */}
          <div className="relative overflow-hidden rounded-2xl border border-gold/35 bg-gradient-to-br from-ink/70 via-ink/50 to-ink/30 p-[clamp(20px,3.5vw,36px)] shadow-2xl">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row gap-7 items-center md:items-start">
              <div className="relative aspect-[3/4] w-full max-w-[280px] md:w-[240px] md:min-w-[240px] overflow-hidden rounded-xl shadow-lg border border-cream/20 shrink-0">
                <Image
                  src="/Vaibhav-standup.png"
                  alt="Vaibhav Karn"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 240px"
                />
                <div className="absolute top-3 left-3 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 font-mono text-[10px] uppercase tracking-[.12em] text-gold border border-gold/40 shadow-sm">
                  Live Headliner
                </div>
              </div>
              <div className="flex flex-col gap-3.5 flex-1 w-full">
                <div>
                  <div className="eyebrow !text-gold mb-1">Closing Act · Stand-up Comedy</div>
                  <div className="font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-tight text-cream">Vaibhav Karn</div>
                </div>
                <p className="m-0 text-base md:text-lg leading-relaxed text-soft max-w-[820px]">
                  Vaibhav Karn is a stand-up comedian who finds humor in everyday chaos and turns relatable moments into punchlines. With his witty timing and crowd-tested charm, he brings a high-energy set packed with sharp observations, unexpected twists, and spontaneous laughs to close the inaugural night in style.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <span className="rounded-md border border-gold/40 bg-gold/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[.1em] text-gold font-semibold">
                    NIT Delhi Students Only
                  </span>
                  <a
                    href="https://www.instagram.com/vaibhavkarn_here"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[15px] font-bold text-cream hover:text-gold transition-colors"
                  >
                    <span>Vaibhav Karn on Instagram</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
