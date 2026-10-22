// Shared admin building blocks, styled to the admin design handoff.

export const btnBase = "cursor-pointer whitespace-nowrap rounded-full border-[1.5px] px-[18px] py-[9px] text-sm font-bold disabled:opacity-60";
export const btnP = `${btnBase} border-rust bg-rust text-cream hover:bg-fg`;
export const btnS = `${btnBase} border-fg/35 bg-transparent text-fg hover:bg-fg/[.06]`;
export const btnD = `${btnBase} border-err/50 bg-transparent text-err hover:bg-err/[.06]`;
export const input = "w-full rounded-lg border-[1.5px] border-fg/[.28] bg-[#fff8ec] px-3 py-2.5 text-[15px] text-fg outline-none focus:border-rust";
export const labelCls = "font-mono text-[11px] uppercase tracking-[.12em] text-fg-3";
export const monoHead = "font-mono text-xs uppercase tracking-[.14em] text-fg-3";

export function PageTitle({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-[680px] flex-col gap-1.5">
        <h1 className="m-0 font-display text-[clamp(30px,4vw,44px)] font-extrabold leading-none tracking-[-.02em]">{title}</h1>
        {sub && <span className="text-base text-fg-3">{sub}</span>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex min-w-0 flex-col gap-4 rounded-[10px] border border-fg/[.18] bg-cream-2 p-5 ${className}`}>{children}</div>;
}

export function CardHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="break-words font-display text-[22px] font-extrabold leading-[1.1]">{title}</span>
        {sub && <span className="text-sm text-fg-3">{sub}</span>}
      </div>
      {right}
    </div>
  );
}

export const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="whitespace-nowrap rounded-full bg-panel px-3 py-1 font-mono text-[11px] uppercase tracking-[.1em] text-cream">{children}</span>
);

export function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${wide ? "col-span-full" : ""}`}>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <span className="text-[13px] text-fg-3">{hint}</span>}
    </div>
  );
}

export const FieldGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">{children}</div>
);

export const CardGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid items-start gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr))]">{children}</div>
);

export function Bar({ label, count, pct, color = "#A82E17" }: { label: string; count: string; pct: number; color?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-3 text-[15px]"><span className="font-semibold">{label}</span><span className="font-mono text-fg-2">{count}</span></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-fg/[.12]"><div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: color }} /></div>
    </div>
  );
}
