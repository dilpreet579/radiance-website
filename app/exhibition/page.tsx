import Image from "next/image";
import { EX_DAYS, EX_SECTIONS } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/exhibition", "Grand Exhibition · Halloween theme", "The Radiance 2026 Grand Exhibition at NIT Delhi, 4 and 5 November: a Halloween-themed showcase of photography, film and design. Open to everyone, no registration needed.");

const RADIANCE_2025_ITEMS = [
  { label: "Exhibition", src: "/Exhibition-1.jpg" },
  { label: "Photo booth", src: "/photobooth.jpeg" },
  { label: "Performances", src: "/performance.jpeg" },
];

export default function Exhibition() {
  return (
    <main className="bg-[#0E0A14] text-[#F6E6D0]">
      <section className="relative overflow-hidden pb-[clamp(64px,9vw,120px)] pt-[clamp(56px,9vw,120px)] [background:radial-gradient(ellipse_at_50%_0%,#3B1766_0%,#150D22_58%,#0E0A14_100%)]">
        <div className="absolute right-[-6vw] top-[-14vw] aspect-square w-[min(640px,80vw)] rounded-full opacity-20 [background:repeating-radial-gradient(circle_at_50%_50%,#FF7A1A_0_3px,transparent_3px_28px)]" />
        <div className="absolute aspect-square w-[calc(min(640px,80vw)*.4)] rounded-full opacity-90 max-sm:[right:-44px] max-sm:[top:-24px] shadow-[0_0_120px_30px_rgba(255,122,26,.35)] [background:radial-gradient(circle,#FF9A3C_0%,#FF7A1A_55%,#C4500A_100%)] [right:calc(-6vw+min(640px,80vw)*.3)] [top:calc(-14vw+min(640px,80vw)*.3)]" />
        <div className="absolute bottom-[-60px] left-[-10%] h-[200px] w-[70%] blur-[30px] [background:radial-gradient(ellipse,rgba(170,130,230,.28),transparent_70%)]" />
        <div className="absolute bottom-[-80px] right-[-10%] h-[220px] w-[60%] blur-[36px] [background:radial-gradient(ellipse,rgba(170,130,230,.2),transparent_70%)]" />
        <div className="wrap relative flex flex-col gap-[26px]">
          <div className="font-mono text-[13px] uppercase tracking-[.16em] text-hw-orange-2">4 &amp; 5 November · NIT Delhi · Halloween theme</div>
          <h1 className="m-0 font-spooky text-[clamp(68px,14vw,200px)] font-normal leading-[.9] tracking-[.02em] text-hw-orange [text-shadow:0_0_48px_rgba(255,122,26,.45)]">Grand<br />Exhibition</h1>
          <p className="m-0 max-w-[620px] text-pretty text-[clamp(18px,2vw,22px)] text-[#EBD9F5]">Two evenings of games, food, films, performances and the best work from Radiance. Open to everyone. No registration needed.</p>
          <div className="mt-2.5 grid max-w-[760px] gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {EX_DAYS.map((d) => (
              <div key={d.k} className="flex flex-col gap-1.5 rounded-[10px] border-[1.5px] border-hw-orange/60 bg-[rgba(14,10,20,.7)] p-[22px]">
                <span className="font-mono text-xs uppercase tracking-[.14em] text-hw-orange-2">{d.k}</span>
                <span className="font-spooky text-[44px] leading-none tracking-[.03em]">{d.date}</span>
                <span className="text-lg font-bold">{d.time}</span>
                <span className="text-[15px] text-hw-lilac">{d.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[clamp(56px,8vw,104px)]">
        <div className="wrap flex flex-col gap-9">
          <h2 className="m-0 font-spooky text-[clamp(44px,7vw,84px)] font-normal leading-none tracking-[.03em] text-hw-orange">What&apos;s inside</h2>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
            {EX_SECTIONS.map((e) => (
              <div key={e.n} className="flex flex-col gap-2.5 sm:min-h-[190px] rounded-[10px] border border-[rgba(180,140,235,.35)] p-6 hover:border-hw-orange [background:linear-gradient(160deg,#1E1233,#130C20)]">
                <span className="font-mono text-xs tracking-[.14em] text-hw-orange-2">{e.n}</span>
                <span className="font-spooky text-[34px] leading-none tracking-[.03em]">{e.t}</span>
                <span className="text-base text-hw-lilac">{e.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-[clamp(56px,8vw,112px)]">
        <div className="wrap flex flex-col gap-6">
          <div className="font-mono text-xs uppercase tracking-[.14em] text-hw-orange-2">Radiance 2025 exhibition</div>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
            {RADIANCE_2025_ITEMS.map((item) => (
              <div
                key={item.label}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-[rgba(180,140,235,.35)] bg-[rgba(14,10,20,.75)] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-hw-orange"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0A14] via-transparent to-transparent opacity-70" />
                </div>
                <div className="p-4 border-t border-[rgba(180,140,235,.2)]">
                  <span className="font-spooky text-[24px] tracking-[.02em] text-[#F6E6D0] group-hover:text-hw-orange transition-colors">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
