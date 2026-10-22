import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function save(form: FormData) {
  "use server";
  await requireAdmin("super");
  const id = String(form.get("id") ?? "");
  const row = {
    name: String(form.get("name")), tagline: String(form.get("tagline")), logo_url: String(form.get("logo_url")),
    link: String(form.get("link")), tier: String(form.get("tier")), position: Number(form.get("position") || 0),
  };
  if (id) await db().from("sponsors").update(row).eq("id", id);
  else await db().from("sponsors").insert(row);
  revalidatePath("/", "layout");
  revalidatePath("/admin/sponsors");
}
async function remove(form: FormData) {
  "use server";
  await requireAdmin("super");
  await db().from("sponsors").delete().eq("id", String(form.get("id")));
  revalidatePath("/", "layout");
  revalidatePath("/admin/sponsors");
}

const inp = "w-full rounded border border-fg/30 bg-white px-2 py-1.5 text-sm";

function Form({ s }: { s?: Record<string, string | number> }) {
  const d = (k: string) => (s?.[k] as string) ?? "";
  return (
    <form action={save} className="grid gap-2 rounded-xl border border-fg/10 bg-cream-2 p-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
      {s && <input type="hidden" name="id" value={d("id")} />}
      <input name="name" defaultValue={d("name")} placeholder="Name" required className={inp} />
      <select name="tier" defaultValue={d("tier") || "associate"} className={inp}><option value="title">Title sponsor (ranks first)</option><option value="associate">Associate</option></select>
      <input name="tagline" defaultValue={d("tagline")} placeholder="Tagline" className={inp} />
      <input name="logo_url" defaultValue={d("logo_url")} placeholder="Logo URL (https://…)" className={inp} />
      <input name="link" defaultValue={d("link")} placeholder="Website link" className={inp} />
      <input name="position" type="number" defaultValue={s?.position as number ?? 0} placeholder="Order" className={inp} />
      <div className="col-span-full flex gap-2">
        <button className="btn btn-rust px-4 py-2 text-sm">{s ? "Save" : "Add sponsor"}</button>
        {s && <button formAction={remove} className="btn border border-err bg-transparent px-4 py-2 text-sm text-err">Delete</button>}
      </div>
    </form>
  );
}

export default async function Page() {
  await requireAdmin("super");
  const { data } = await db().from("sponsors").select("*").order("tier").order("position");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="m-0 font-display text-3xl font-extrabold">Sponsors</h1>
      <p className="m-0 text-sm text-fg-3">Paste a hosted logo URL (e.g. upload to Supabase Storage as public and copy the link). The title sponsor shows in the header, footer and home page.</p>
      {(data ?? []).map((s) => <Form key={s.id} s={s} />)}
      <h2 className="m-0 mt-4 font-display text-xl font-extrabold">Add new</h2>
      <Form />
    </div>
  );
}
