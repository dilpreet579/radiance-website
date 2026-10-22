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
  return (
    <form
      id={id}
      className={className}
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const sub = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        const fd = new FormData(form);
        const op = sub?.value || "save";
        if (confirms[op] && !window.confirm(confirms[op])) return;
        fd.set("op", op);
        start(async () => {
          try {
            const r = await action(fd);
            toast(typeof r === "string" ? r : (messages[op] ?? "Saved")); // an action may return its own message
            router.refresh();
          } catch (err) {
            toast((err as Error).message || "Something went wrong");
          }
        });
      }}
    >
      {children}
    </form>
  );
}
