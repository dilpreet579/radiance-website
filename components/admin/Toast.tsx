"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useRef, useState, useTransition } from "react";

const Ctx = createContext<(m: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState("");
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((m: string) => {
    setMsg(m);
    clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(""), 2400);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {msg && (
        <div className="fixed bottom-6 left-1/2 z-[100] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-full bg-fg px-[22px] py-3 text-[15px] font-semibold text-cream shadow-[0_8px_30px_rgba(0,0,0,.35)]">
          {msg}
        </div>
      )}
    </Ctx.Provider>
  );
}

// Form for a server action. The clicked button's name="op" value="…" is posted with the fields,
// and `messages[op]` is shown as a toast on success. Refreshes server data afterwards.
export function AForm({
  action, messages = {}, confirm: confirms = {}, id, className, children,
}: {
  action: (f: FormData) => Promise<unknown>;
  messages?: Record<string, string>;
  confirm?: Record<string, string>; // op -> confirm() prompt
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirmPrompt, setConfirmPrompt] = useState<{ op: string; text: string; form: HTMLFormElement } | null>(null);

  const executeAction = (form: HTMLFormElement, op: string) => {
    const fd = new FormData(form);
    fd.set("op", op);
    start(async () => {
      try {
        const r = await action(fd);
        toast(typeof r === "string" ? r : (messages[op] ?? "Saved"));
        router.refresh();
      } catch (err) {
        toast((err as Error).message || "Something went wrong");
      }
    });
  };

  return (
    <>
      <form
        id={id}
        className={className}
        aria-busy={pending}
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const sub = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
          const op = sub?.value || "save";
          if (confirms[op]) {
            setConfirmPrompt({ op, text: confirms[op], form });
            return;
          }
          executeAction(form, op);
        }}
      >
        {children}
      </form>

      {confirmPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmPrompt(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="flex w-full max-w-[440px] flex-col gap-4 rounded-2xl border border-fg/20 bg-cream p-6 text-fg shadow-[0_20px_60px_rgba(0,0,0,.5)]"
          >
            <div className="flex items-center justify-between border-b border-fg/15 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-err/15 text-err font-bold text-sm">
                  ⚠
                </span>
                <span className="font-display text-lg font-extrabold text-panel">Please Confirm</span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmPrompt(null)}
                className="cursor-pointer text-lg font-bold text-fg-3 hover:text-fg"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="m-0 text-[15px] text-fg leading-relaxed">
              {confirmPrompt.text}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-fg/15">
              <button
                type="button"
                onClick={() => setConfirmPrompt(null)}
                className="cursor-pointer rounded-full border border-fg/30 bg-transparent px-4 py-2 text-sm font-semibold text-fg hover:bg-fg/[.06] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const { op, form } = confirmPrompt;
                  setConfirmPrompt(null);
                  executeAction(form, op);
                }}
                className="cursor-pointer rounded-full border border-err bg-err px-5 py-2 text-sm font-bold text-white hover:bg-err/90 transition-colors"
              >
                {confirmPrompt.op === "delete" ? "Delete" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
