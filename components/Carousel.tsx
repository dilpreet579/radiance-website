"use client";

import { useState } from "react";
import Image from "next/image";
import { SLIDES } from "@/lib/content";

export default function Carousel() {
  const [i, setI] = useState(0);
  const n = SLIDES.length;
  const pad = (x: number) => String(x).padStart(2, "0");
  const arrow = "h-12 w-12 cursor-pointer rounded-full border-[1.5px] border-cream/50 bg-transparent text-xl text-cream hover:bg-gold hover:text-bg transition-colors flex items-center justify-center";

  return (
    <>
      <div className="flex items-center gap-3.5">
        <span className="mr-1.5 font-mono text-[13px] tracking-[.1em] text-muted">{pad(i + 1)} / {pad(n)}</span>
        <button aria-label="Previous photo" className={arrow} onClick={() => setI((i + n - 1) % n)}>←</button>
        <button aria-label="Next photo" className={arrow} onClick={() => setI((i + 1) % n)}>→</button>
      </div>
      <div className="basis-full overflow-hidden rounded-lg shadow-lg">
        <div className="flex transition-transform duration-[600ms] ease-[cubic-bezier(.2,.7,.2,1)]" style={{ transform: `translateX(-${i * 100}%)` }}>
          {SLIDES.map((slide, idx) => (
            <div key={idx} className="relative aspect-video max-h-[640px] shrink-0 grow-0 basis-full overflow-hidden bg-ink/40">
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                priority={idx === 0}
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
                quality={85}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-6 pt-12">
                <span className="font-mono text-xs uppercase tracking-[.14em] text-gold">Radiance Highlights</span>
                <div className="font-display text-2xl font-bold text-white mt-1">{slide.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex basis-full flex-wrap gap-2 pt-2">
        {SLIDES.map((_, k) => (
          <button
            key={k}
            aria-label={`Go to photo ${k + 1}`}
            onClick={() => setI(k)}
            className="h-2.5 cursor-pointer rounded-full border-0 p-0 transition-all duration-300"
            style={{ width: k === i ? 28 : 10, background: k === i ? "#EBB65B" : "rgba(244,233,217,.3)" }}
          />
        ))}
      </div>
    </>
  );
}
