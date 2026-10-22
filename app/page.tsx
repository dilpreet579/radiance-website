import Link from "next/link";
import Carousel from "@/components/Carousel";
import { LogoSlot, Notes, RegisterBtn } from "@/components/ui";
import { COLLABS, DISCIPLINES, NOTES, SCHEDULE, SPEAKERS, STATS } from "@/lib/content";
import { EVENT_LD } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { getAssociateSponsors, getTitleSponsor } from "@/lib/sponsors";

export const revalidate = 60;

export default async function Home() {
  const [sponsor, associates, { notes }] = await Promise.all([getTitleSponsor(), getAssociateSponsors(), getSettings()]);
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_LD) }} />
      <section className="pattern-bg pb-[clamp(56px,8vw,104px)] pt-[clamp(40px,6vw,80px)]">
        <div className="wrap flex flex-col items-center gap-[clamp(28px,4vw,44px)] text-center">
          <div className="font-mono text-[13px] uppercase tracking-[.14em] text-gold">3rd edition · NIT Delhi Annual Creative Fest</div>
          <div className="w-[min(980px,100%)] rounded-md bg-cream p-[clamp(8px,2vw,28px)] shadow-[clamp(6px,1vw,12px)_clamp(6px,1vw,12px)_0_#1E0407]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/radiance26-logo.png" alt="Radiance 2026 NIT Delhi, Clairvoyance presents" className="block w-full" />
          </div>
          <p className="m-0 max-w-[700px] text-balance text-[clamp(19px,2.2vw,24px)]">
            Hands-on sessions with industry creators across photography, filmmaking, motion design and graphic design.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-11 gap-y-3.5">
            <div className="font-display text-[clamp(34px,5vw,56px)] font-extrabold leading-none tracking-[-.02em] text-gold">26 Oct – 5 Nov</div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2.5 text-[15px] text-soft">
              <span className="max-sm:basis-full max-sm:text-center">Presented by</span>
              <LogoSlot h={40} logo={sponsor.logo_url} />
              <span className="font-bold text-cream">{sponsor.name}</span>
            </div>
          </div>
          <div className="flex justify-center">
            <RegisterBtn className="px-[38px] py-[18px] text-[18px] font-bold shadow-md hover:scale-[1.02] transition-transform">Register now</RegisterBtn>
          </div>
        </div>
      </section>

      <section className="bg-cream text-fg">
        <div className="wrap grid [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {STATS.map((s) => (
            <div key={s.l} className="flex flex-col gap-1.5 border-l border-fg/[.18] px-[clamp(0px,2vw,28px)] py-[clamp(32px,5vw,56px)]">
              <div className="font-display text-[clamp(56px,8vw,104px)] font-extrabold leading-[.95] tracking-[-.03em] text-panel">{s.n}</div>
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
              <Link key={d.title} href={d.href} className="flex flex-wrap items-baseline gap-x-8 gap-y-2.5 border-t border-cream/[.18] py-[26px] text-cream hover:bg-cream/[.06] hover:text-cream">
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
          <div className="mt-7"><Notes items={NOTES} /></div>
        </div>
      </section>

      <section className="bg-cream py-[clamp(56px,8vw,112px)] text-fg">
        <div className="wrap flex flex-col gap-[clamp(48px,7vw,88px)]">
          <div className="grid items-center gap-[clamp(28px,5vw,72px)] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            <div className="flex flex-col gap-5">
              <div className="eyebrow !text-rust">Title Sponsor</div>
              <h2 className="h2">{sponsor.tagline}</h2>
              {sponsor.link && <a href={sponsor.link} className="inline-flex gap-2 py-2 font-bold !text-rust hover:!text-fg">Visit {sponsor.name} <span>↗</span></a>}
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
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
              {COLLABS.map((c) => (
                <div key={c.n} className="flex min-h-[136px] flex-col items-center justify-between gap-3 rounded-lg border border-fg/15 bg-cream/60 p-4 text-center transition-all hover:bg-cream hover:shadow-sm">
                  <div className="flex h-12 w-full items-center justify-center">
                    {"logo" in c && c.logo ? (
                      <img src={c.logo} alt={c.n} className="max-h-14 max-w-[150px] object-contain" />
                    ) : (
                      <span className="font-display text-lg font-bold leading-[1.15]">{c.n}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-display text-base font-bold text-fg leading-tight">{c.n}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[.1em] text-fg-2">{c.s}</span>
                  </div>
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
                <span className="font-display text-[clamp(20px,3vw,34px)] font-bold leading-tight tracking-[-.015em]">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
