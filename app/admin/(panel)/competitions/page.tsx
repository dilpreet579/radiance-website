import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function save(form: FormData) {
  "use server";
  await requireAdmin("super");
  const id = String(form.get("id") ?? "");
  const row = {
    kind: String(form.get("kind")), genre: String(form.get("genre")), title: String(form.get("title")),
    description: String(form.get("description")), prize: String(form.get("prize")), theme: String(form.get("theme")),
    deadline: String(form.get("deadline")), url: String(form.get("url")), live: form.get("live") === "on",
    position: Number(form.get("position") || 0),
  };
  const { error } = id ? await db().from("competitions").update(row).eq("id", id) : await db().from("competitions").insert(row);
  if (error) throw new Error(error.message);
  revalidatePath("/competitions");
  revalidatePath("/admin/competitions");
}
async function remove(form: FormData) {
  "use server";
  await requireAdmin("super");
  await db().from("competitions").delete().eq("id", String(form.get("id")));
  revalidatePath("/competitions");
  revalidatePath("/admin/competitions");
}

const inp = "w-full rounded border border-fg/30 bg-white px-2 py-1.5 text-sm";

function Form({ c }: { c?: Record<string, string | number | boolean> }) {
  const d = (k: string) => (c?.[k] as string) ?? "";
  return (
    <form action={save} className="grid gap-2 rounded-xl border border-fg/10 bg-cream-2 p-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
      {c && <input type="hidden" name="id" value={d("id")} />}
      <select name="kind" defaultValue={d("kind") || "online"} className={inp}><option value="online">Online (Unstop)</option><option value="campus">In-campus (Google Form)</option></select>
      <input name="genre" defaultValue={d("genre")} placeholder="Genre" required className={inp} />
      <input name="title" defaultValue={d("title")} placeholder="Title" required className={inp} />
      <input name="prize" defaultValue={d("prize")} placeholder="Prize" className={inp} />
      <input name="theme" defaultValue={d("theme")} placeholder="Theme" className={inp} />
      <input name="deadline" defaultValue={d("deadline")} placeholder="Deadline" className={inp} />
      <input name="url" defaultValue={d("url")} placeholder="Unstop / Google Form URL" className={inp} />
      <input name="position" type="number" defaultValue={c?.position as number ?? 0} placeholder="Order" className={inp} />
      <textarea name="description" defaultValue={d("description")} placeholder="Description" className={inp + " col-span-full"} />
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="live" defaultChecked={!!c?.live} /> Live (show link)</label>
      <div className="col-span-full flex gap-2">
        <button className="btn btn-rust px-4 py-2 text-sm">{c ? "Save" : "Add competition"}</button>
        {c && <button formAction={remove} className="btn border border-err bg-transparent px-4 py-2 text-sm text-err">Delete</button>}
      </div>
    </form>
  );
}

export default async function Page() {
  await requireAdmin("super");
  const { data } = await db().from("competitions").select("*").order("kind").order("position");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="m-0 font-display text-3xl font-extrabold">Competitions</h1>
      <p className="m-0 text-sm text-fg-3">When this list is empty the public page shows the placeholder competitions. Turn &quot;Live&quot; on per competition on 26 Oct.</p>
      {(data ?? []).map((c) => <Form key={c.id} c={c} />)}
      <h2 className="m-0 mt-4 font-display text-xl font-extrabold">Add new</h2>
      <Form />
    </div>
  );
}
