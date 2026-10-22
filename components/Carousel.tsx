"use client";

import { useState } from "react";
import { SLIDES } from "@/lib/content";

// Placeholder slides; swap SLIDES for uploaded photos when organizers send them.
export default function Carousel() {
  const [i, setI] = useState(0);
  const n = SLIDES.length;
  const pad = (x: number) => String(x).padStart(2, "0");
  const arrow = "h-12 w-12 cursor-pointer rounded-full border-[1.5px] border-cream/50 bg-transparent text-xl text-cream hover:bg-gold hover:text-bg";
  return (
    <>
      <div className="flex items-center gap-3.5">
        <span className="mr-1.5 font-mono text-[13px] tracking-[.1em] text-muted">{pad(i + 1)} / {pad(n)}</span>
        <button aria-label="Previous photo" className={arrow} onClick={() => setI((i + n - 1) % n)}>←</button>
        <button aria-label="Next photo" className={arrow} onClick={() => setI((i + 1) % n)}>→</button>
      </div>
      <div className="basis-full overflow-hidden rounded">
        <div className="flex transition-transform duration-[600ms] ease-[cubic-bezier(.2,.7,.2,1)]" style={{ transform: `translateX(-${i * 100}%)` }}>
          {SLIDES.map((label) => (
            <div key={label} className="placeholder flex aspect-video max-h-[640px] shrink-0 grow-0 basis-full flex-col items-center justify-center gap-2 p-5 text-center font-mono uppercase">
              <span className="text-[13px] tracking-[.14em]">Radiance 2025 · {label}</span>
              <span className="text-xs tracking-[.1em] text-muted">placeholder photo</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex basis-full gap-2">
        {SLIDES.map((label, k) => (
          <button
            key={label}
            aria-label={`Go to photo ${k + 1}`}
            onClick={() => setI(k)}
            className="relative h-2.5 cursor-pointer rounded-full border-0 p-0 transition-all duration-300 before:absolute before:-inset-x-1 before:-inset-y-3 before:content-['']"
            style={{ width: k === i ? 28 : 10, background: k === i ? "#EBB65B" : "rgba(244,233,217,.3)" }}
          />
        ))}
      </div>
    </>
  );
}
