import Link from "next/link";
import Carousel from "@/components/Carousel";
import { LogoSlot, Notes, RegisterBtn } from "@/components/ui";
import { COLLABS, DISCIPLINES, SCHEDULE, SPEAKERS, STATS } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { getAssociateSponsors, getTitleSponsor } from "@/lib/sponsors";

export const revalidate = 60;

export default async function Home() {
  const [sponsor, associates, { notes }] = await Promise.all([getTitleSponsor(), getAssociateSponsors(), getSettings()]);
  return (
    <main>
      <section className="pattern-bg pb-[clamp(56px,8vw,104px)] pt-[clamp(40px,6vw,80px)]">
        <div className="wrap flex flex-col items-center gap-[clamp(28px,4vw,44px)] text-center">
          <div className="font-mono text-[13px] uppercase tracking-[.14em] text-gold">3rd edition · NIT Delhi Annual Creative Fest</div>
          <div className="w-[min(980px,100%)] rounded-md bg-cream p-[clamp(8px,2vw,28px)] shadow-[clamp(6px,1vw,12px)_clamp(6px,1vw,12px)_0_#1E0407]">
            <div className="aspect-[2172/510] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/radiance26-logo.png" alt="Radiance 2026 NIT Delhi, Clairvoyance presents" className="-mt-[3.2%] block w-full" />
            </div>
          </div>
          <p className="m-0 max-w-[700px] text-balance text-[clamp(19px,2.2vw,24px)]">
            Hands-on sessions with industry creators across photography, filmmaking, motion design and graphic design.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-11 gap-y-3.5">
            <div className="font-display text-[clamp(34px,5vw,56px)] font-extrabold leading-none tracking-[-.02em] text-gold">26 Oct – 5 Nov</div>
            <div className="flex items-center gap-3 text-[15px] text-soft">
              <span>In association with</span>
              <LogoSlot h={40} logo={sponsor.logo_url} />
              <span className="font-bold text-cream">{sponsor.name}</span>
              <span className="rounded-[3px] border border-gold/60 px-2 py-[3px] font-mono text-[11px] uppercase tracking-[.12em] text-gold">Title Sponsor</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3.5">
            <RegisterBtn className="px-[30px] py-4 text-[17px]">Register now</RegisterBtn>
            <Link href="/competitions" className="btn btn-ghost px-[30px] py-4 text-[17px]">Competitions on Unstop <span>↗</span></Link>
          </div>
        </div>
      </section>

      <section className="bg-cream text-fg">
        <div className="wrap grid [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {STATS.map((s) => (
            <div key={s.l} className="flex flex-col gap-1.5 border-l border-fg/[.18] px-[clamp(0px,2vw,28px)] py-[clamp(32px,5vw,56px)]">
              <div className="font-display text-[clamp(56px,8vw,104px)] font-extrabold leading-[.95] tracking-[-.03em] text-[#430b10]">{s.n}</div>
              <div className="text-[17px] font-semibold text-fg-2">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-panel py-[clamp(56px,8vw,112px)]">
        <div className="wrap grid gap-[clamp(32px,5vw,80px)] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          <div className="flex flex-col gap-[18px]">
            <div className="eyebrow">About</div>
            <h2 className="h2">An 8-day creative learning festival</h2>
          </div>
          <div className="flex flex-col gap-[22px]">
            <p className="m-0 text-pretty text-[19px]">Radiance is envisioned as an 8-day creative learning festival designed to provide students with practical and experiential exposure to diverse domains of visual storytelling, including Photography, Filmmaking, Video Editing and Graphic Design.</p>
            <p className="m-0 text-pretty text-muted">Organized by Clairvoyance, the Photography and Film Club of NIT Delhi. The festival features an inaugural session, expert-led workshops, creative competitions, a photo walk and a themed grand exhibition.</p>
            <div className="flex flex-wrap gap-2.5">
              {DISCIPLINES.map((d) => <span key={d} className="rounded-full border border-gold/55 px-4 py-[7px] text-sm font-semibold text-gold">{d}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-panel pb-[clamp(56px,8vw,112px)]">
        <div className="wrap">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <div className="flex flex-col gap-4">
              <div className="eyebrow">Schedule</div>
              <h2 className="h2">26 Oct to 5 Nov</h2>
            </div>
            <RegisterBtn />
          </div>
          <div className="border-b border-cream/[.18]">
            {SCHEDULE.map((d) => (
              <Link key={d.title} href={d.href} className="-mx-4 flex flex-wrap items-baseline gap-x-8 gap-y-2.5 border-t border-cream/[.18] px-4 py-[26px] text-cream hover:bg-cream/[.06] hover:text-cream">
                <div className="flex basis-[200px] items-baseline gap-3">
                  <span className="font-display text-5xl font-extrabold leading-none text-gold">{d.day}</span>
                  <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[.12em] text-muted">{d.mon} · {d.dow}</span>
                </div>
                <div className="basis-80 flex-1">
                  <div className="font-display text-[clamp(21px,2.4vw,28px)] font-bold leading-[1.15]">{d.title}</div>
                  <div className="mt-1 text-[15px] text-muted">{d.sub}</div>
                </div>
                <div className="flex shrink basis-[270px] flex-col gap-0.5 text-[15px]">
                  <span className="font-bold">{d.time}</span>
                  <span className="text-muted">{d.who}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-7"><Notes items={notes} /></div>
        </div>
      </section>

      <section className="bg-cream py-[clamp(56px,8vw,112px)] text-fg">
        <div className="wrap flex flex-col gap-[clamp(48px,7vw,88px)]">
          <div className="grid items-center gap-[clamp(28px,5vw,72px)] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            <div className="flex flex-col gap-5">
              <div className="eyebrow !text-rust">Title Sponsor</div>
              <h2 className="h2">{sponsor.tagline}</h2>
              {sponsor.link && <a href={sponsor.link} className="inline-flex gap-2 font-bold !text-rust hover:!text-fg">Visit {sponsor.name} <span>↗</span></a>}
            </div>
            {sponsor.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sponsor.logo_url} alt={sponsor.name} className="aspect-video w-full object-contain" />
            ) : (
              <div className="grid aspect-video place-items-center border-[1.5px] border-dashed border-rust/55 p-4 text-center font-mono text-xs uppercase tracking-[.12em] text-rust-dk [background:repeating-linear-gradient(135deg,rgba(168,46,23,.1)_0_12px,rgba(168,46,23,.03)_12px_24px)]">
                <span>{sponsor.name} logo<br />high-res file to be supplied</span>
              </div>
            )}
          </div>
          {associates.length > 0 && (
            <div className="flex flex-col gap-[22px] border-t border-fg/20 pt-[clamp(32px,4vw,48px)]">
              <div className="eyebrow !text-rust">Associate sponsors</div>
              <div className="flex flex-wrap gap-x-10 gap-y-4">
                {associates.map((a) => (
                  <a key={a.name} href={a.link || undefined} className="font-display text-xl font-bold !text-fg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {a.logo_url ? <img src={a.logo_url} alt={a.name} className="h-12 object-contain" /> : a.name}
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-[22px] border-t border-fg/20 pt-[clamp(32px,4vw,48px)]">
            <div className="eyebrow !text-rust">Past collaborators</div>
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
              {COLLABS.map((c) => (
                <div key={c.n} className="flex min-h-[104px] flex-col items-center justify-center gap-1 border-[1.5px] border-dashed border-rust/45 p-3.5 text-center [background:repeating-linear-gradient(135deg,rgba(168,46,23,.07)_0_10px,transparent_10px_20px)]">
                  <span className="font-display text-lg font-bold leading-[1.15]">{c.n}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[.1em] text-rust-dk">{c.s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg py-[clamp(56px,8vw,112px)]">
        <div className="wrap flex flex-wrap items-end justify-between gap-x-5 gap-y-8">
          <div className="flex flex-col gap-4">
            <div className="eyebrow">Radiance 2025</div>
            <h2 className="h2">Last year in photographs</h2>
          </div>
          <Carousel />
        </div>
      </section>

      <section className="pattern-bg py-[clamp(56px,8vw,112px)]">
        <div className="wrap flex flex-col gap-7">
          <div className="eyebrow">Past speakers</div>
          <div>
            {SPEAKERS.map((n, i) => (
              <div key={n} className="flex items-baseline gap-6 border-t border-cream/20 py-[clamp(14px,2vw,22px)]">
                <span className="basis-7 font-mono text-[13px] text-gold">0{i + 1}</span>
                <span className="font-display text-[clamp(30px,5.4vw,68px)] font-extrabold leading-[1.02] tracking-[-.025em]">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
