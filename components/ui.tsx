import Link from "next/link";
import type { Sponsor } from "@/lib/sponsors";

// Shows the sponsor's logo, or a hatched stand-in until the logo is supplied.
export function LogoSlot({ w = 56, h = 22, logo }: { w?: number; h?: number; logo?: string }) {
  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt="" style={{ height: h, maxWidth: w * 2, objectFit: "contain" }} />;
  }
  return (
    <span
      style={{
        width: w,
        height: h,
        display: "inline-block",
        border: "1px dashed rgba(244,233,217,.5)",
        background: "repeating-linear-gradient(135deg,rgba(244,233,217,.16) 0 6px,transparent 6px 12px)",
      }}
    />
  );
}

export function SponsorLine({ sponsor, size = 12 }: { sponsor: Sponsor; size?: number }) {
  return (
    <div className="flex items-center gap-3 font-mono uppercase tracking-[.12em] text-muted" style={{ fontSize: size }}>
      <span>Title Sponsor</span>
      <LogoSlot h={32} logo={sponsor.logo_url} />
      <span className="text-cream">{sponsor.name}</span>
    </div>
  );
}

export function Notes({ items }: { items: { k: string; t: string }[] }) {
  return (
    <div className="grid gap-x-10 gap-y-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
      {items.map((n) => (
        <div key={n.k} className="text-[15px] text-muted">
          <span className="mb-0.5 block font-mono text-xs uppercase tracking-[.12em] text-gold sm:mb-0 sm:mr-2.5 sm:inline">{n.k}</span>
          {n.t}
        </div>
      ))}
    </div>
  );
}

export function Placeholder({ label, className = "", style }: { label: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`placeholder flex flex-col items-center justify-center gap-1.5 p-5 text-center font-mono uppercase ${className}`} style={style}>
      <span className="text-[13px] tracking-[.14em]">{label}</span>
      <span className="text-xs tracking-[.1em] text-muted">placeholder photo</span>
    </div>
  );
}

export const RegisterBtn = ({ className = "px-[26px] py-3.5 text-base", children = "Register" }: { className?: string; children?: React.ReactNode }) => (
  <Link href="/register" className={`btn btn-gold ${className}`}>
    {children} <span>→</span>
  </Link>
);
