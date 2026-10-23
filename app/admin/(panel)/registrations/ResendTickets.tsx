"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";
import { btnS } from "@/components/admin/ui";

// Resending emails real students, so the button opens a modal and only works after typing RESEND (the server checks it too).
export default function ResendTickets({ unsent, action }: { unsent: number; action: (confirm: string) => Promise<string> }) {
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  function close() {
    if (busy) return;
    setOpen(false);
    setText("");
  }

  useEffect(() => {
    if (!open || busy) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function go() {
    setBusy(true);
    try {
      toast(await action(text));
      setOpen(false);
      setText("");
      router.refresh();
    } catch {
      toast("Could not resend tickets");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnS}>Resend unsent tickets ({unsent})</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs" onClick={(e) => e.target === e.currentTarget && close()}>
          <div role="dialog" aria-modal="true" className="flex w-full max-w-[480px] flex-col gap-5 rounded-[18px] border border-fg/20 bg-cream p-6 text-fg shadow-[0_20px_60px_rgba(0,0,0,.5)]">
            <span className="font-display text-xl font-extrabold text-panel">Resend unsent tickets</span>
            <p className="m-0 text-[15px] leading-relaxed">
              This emails the ticket to <strong>{unsent}</strong> students whose ticket was never sent (up to 40 per click). Check the list in Supabase first: anyone wrongly marked unsent gets a duplicate email.
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-[.1em] text-fg-3">
                To confirm, type <strong className="select-all font-mono text-err">RESEND</strong> below:
              </label>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type RESEND to confirm"
                disabled={busy}
                autoFocus
                className="w-full rounded-lg border-[1.5px] border-fg/30 bg-cream-2 px-3.5 py-2.5 font-mono text-[15px] text-fg outline-none focus:border-err"
              />
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-fg/15 pt-3">
              <button type="button" onClick={close} disabled={busy} className="cursor-pointer rounded-full border border-fg/30 bg-transparent px-4 py-2 text-sm font-semibold text-fg hover:bg-fg/[.06] disabled:opacity-50">Cancel</button>
              <button type="button" onClick={go} disabled={text !== "RESEND" || busy} className="cursor-pointer rounded-full border border-err bg-err px-5 py-2 text-sm font-bold text-white hover:bg-err/90 disabled:cursor-not-allowed disabled:opacity-40">
                {busy ? "Sending…" : "Send tickets"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
