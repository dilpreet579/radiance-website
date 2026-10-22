import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getSettings, setSetting, type Consent } from "@/lib/settings";

export const dynamic = "force-dynamic";

async function save(form: FormData) {
  "use server";
  await requireAdmin("super");
  const s = await getSettings();
  const g = (k: string) => String(form.get(k) ?? "").trim();
  await setSetting("seat_cap", Math.max(0, Number(g("seat_cap")) || s.seat_cap));
  await setSetting("notes", [
    { k: "Refreshments", t: g("refreshments") },
    { k: "SRHC campus bus", t: g("srhc") },
  ]);
  const cons = (list: typeof s.consents.nit, prefix: string) => list.map((c) => ({ key: c.key, t: g(`${prefix}_${c.key}_t`) || c.t, d: g(`${prefix}_${c.key}_d`) || c.d }));
  await setSetting("consents", { nit: cons(s.consents.nit, "nit"), outside: cons(s.consents.outside, "out") });
  revalidatePath("/", "layout");
}

const inp = "w-full rounded border border-fg/30 bg-white px-2 py-1.5 text-sm";

function Consents({ list, prefix, title }: { list: Consent[]; prefix: string; title: string }) {
  return (
    <fieldset className="grid gap-2 rounded-xl border border-fg/10 bg-cream-2 p-4">
      <legend className="px-1 font-semibold">{title}</legend>
      {list.map((c) => (
        <div key={c.key} className="grid gap-1">
          <input name={`${prefix}_${c.key}_t`} defaultValue={c.t} className={inp} />
          <textarea name={`${prefix}_${c.key}_d`} rows={3} defaultValue={c.d} className={inp} />
        </div>
      ))}
    </fieldset>
  );
}

export default async function Page() {
  await requireAdmin("super");
  const s = await getSettings();
  const note = (k: string) => s.notes.find((n) => n.k === k)?.t ?? "";
  return (
    <form action={save} className="flex max-w-2xl flex-col gap-4">
      <h1 className="m-0 font-display text-3xl font-extrabold">Settings</h1>
      <label className="grid gap-1 text-sm font-semibold">Outside seats per workshop<input name="seat_cap" type="number" min={0} defaultValue={s.seat_cap} className={inp + " max-w-32"} /></label>
      <label className="grid gap-1 text-sm font-semibold">Refreshments note<textarea name="refreshments" rows={2} defaultValue={note("Refreshments")} className={inp} /></label>
      <label className="grid gap-1 text-sm font-semibold">SRHC campus bus note<textarea name="srhc" rows={2} defaultValue={note("SRHC campus bus")} className={inp} /></label>
      <Consents list={s.consents.nit} prefix="nit" title="NIT Delhi undertakings" />
      <Consents list={s.consents.outside} prefix="out" title="Outside student undertaking" />
      <button className="btn btn-rust self-start px-6 py-3 text-base">Save settings</button>
    </form>
  );
}
