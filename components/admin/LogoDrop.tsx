"use client";

import { useState } from "react";

// Dashed drop area from the admin design. A real <input type=file name="logo"> sits invisibly over it.
export default function LogoDrop({ current }: { current?: string }) {
  const [picked, setPicked] = useState("");
  return (
    <div className="relative grid h-[84px] place-items-center border-[1.5px] border-dashed border-rust/55 text-center font-mono text-xs uppercase tracking-[.12em] text-rust-dk [background:repeating-linear-gradient(135deg,rgba(168,46,23,.1)_0_10px,rgba(168,46,23,.03)_10px_20px)]">
      {picked ? <span>{picked}</span> : current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="Current logo" className="max-h-[68px] max-w-[80%] object-contain" />
      ) : <span>Logo · drop file here</span>}
      <input type="file" name="logo" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="absolute inset-0 cursor-pointer opacity-0"
        onChange={(e) => setPicked(e.target.files?.[0]?.name ?? "")} />
    </div>
  );
}
