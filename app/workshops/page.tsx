import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { Notes, Placeholder } from "@/components/ui";
import { WORKSHOPS } from "@/lib/content";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export default async function Workshops() {
  const { notes: NOTES, seat_cap } = await getSettings();
  return (
    <>
      <PageHeader path="/workshops" />
      <main className="bg-panel pb-[clamp(56px,8vw,112px)] pt-[clamp(40px,6vw,80px)]">
        <div className="wrap flex flex-col gap-[clamp(48px,7vw,96px)]">
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-lg bg-cream p-[clamp(22px,3vw,34px)] text-fg">
            <div className="flex basis-[380px] flex-1 flex-col gap-1.5">
              <div className="font-display text-2xl font-extrabold leading-[1.15]">One registration covers every workshop</div>
              <div className="text-base text-fg-2">NIT Delhi students get the Universal Pass. Outside students pick their workshops on the registration page, {seat_cap} seats per workshop.</div>
            </div>
            <Link href="/register" className="btn btn-rust px-[26px] py-3.5 text-base">Go to registration <span>→</span></Link>
          </div>

          {WORKSHOPS.map((w, i) => (
            <section key={w.n} className="grid items-start gap-[clamp(28px,5vw,72px)] border-t border-cream/20 pt-[clamp(32px,4vw,56px)] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
              {w.photo.startsWith("/") ? (
                <div className={`relative aspect-[4/5] max-h-[560px] w-full overflow-hidden rounded-lg ${i % 2 ? "min-[700px]:order-2" : ""}`}>
                  <Image
                    src={w.photo}
                    alt={w.speaker}
                    fill
                    className="object-cover"
                    style={{ objectPosition: "center 40%" }}
                    sizes="(max-width: 700px) 100vw, 50vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-5 pt-10">
                    <div className="font-display text-xl font-bold text-white">{w.speaker}</div>
                    {"role" in w && <div className="font-mono text-xs uppercase tracking-[.12em] text-gold">{(w as { role?: string }).role}</div>}
                  </div>
                </div>
              ) : (
                <Placeholder label={w.photo} className={`aspect-[4/5] max-h-[560px] w-full ${i % 2 ? "min-[700px]:order-2" : ""}`} />
              )}
              <div className="flex flex-col gap-5">
                <div className="font-mono text-[13px] uppercase tracking-[.14em] text-gold">Workshop {w.n} · {w.date}</div>
                <h2 className="m-0 text-balance font-display text-[clamp(34px,4.6vw,60px)] font-extrabold leading-none tracking-[-.02em]">{w.title}</h2>
                
                <div className="flex flex-wrap gap-2">
                  {[w.time, "NIT Delhi + outside (limited)"].map((c) => <span key={c} className="chip !px-3.5 !py-1.5">{c}</span>)}
                </div>
                <div className="flex items-baseline gap-3.5 border-y border-cream/20 py-[18px]">
                  <span className="font-display text-[clamp(40px,5vw,60px)] font-extrabold leading-none tracking-[-.02em] text-gold">{w.big}</span>
                  <span className="text-[15px] text-muted">{w.bigLabel}</span>
                </div>
                <div>
                  <div className="font-display text-[22px] font-bold">{w.speaker}</div>
                  {"role" in w && <div className="mb-1 font-mono text-xs uppercase tracking-[.12em] text-gold">{(w as { role?: string }).role}</div>}
                  <p className="mb-0 mt-1.5 text-pretty text-soft">{w.bio}</p>
                </div>
                {w.points.length > 0 && (
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {w.points.map((p) => (
                      <li key={p} className="flex gap-3 text-base"><span className="text-gold">→</span><span>{p}</span></li>
                    ))}
                  </ul>
                )}
                {/* link appears once a real URL is set in lib/content.ts */}
                {w.url && <a href={w.url} target="_blank" rel="noopener noreferrer" className="inline-flex gap-2 text-[15px] font-bold">{w.social} <span>↗</span></a>}
              </div>
            </section>
          ))}

          <div className="border-t border-cream/20 pt-7"><Notes items={NOTES} /></div>
        </div>
      </main>
    </>
  );
}
