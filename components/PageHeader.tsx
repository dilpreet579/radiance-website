import { PAGE_META } from "@/lib/content";

export default function PageHeader({ path }: { path: string }) {
  const m = PAGE_META[path];
  return (
    <section className="pattern-bg border-b border-cream/[.12] pb-[clamp(40px,6vw,72px)] pt-[clamp(48px,7vw,88px)]">
      <div className="wrap flex flex-col gap-[22px]">
        <div className="font-mono text-[13px] uppercase tracking-[.14em] text-gold">{m.eyebrow}</div>
        <h1 className="m-0 max-w-[960px] text-balance font-display text-[clamp(44px,7vw,92px)] font-extrabold leading-[.96] tracking-[-.025em]">{m.title}</h1>
        <p className="m-0 max-w-[660px] text-pretty text-[clamp(18px,2vw,21px)] text-soft">{m.lead}</p>
        {m.chips.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-2.5">
            {m.chips.map((c) => <span key={c} className="chip">{c}</span>)}
          </div>
        )}
      </div>
    </section>
  );
}
