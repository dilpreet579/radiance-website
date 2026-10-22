import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function save(form: FormData) {
  "use server";
  await requireAdmin("super");
  const id = String(form.get("id") ?? "");
  const row = { name: String(form.get("name")).trim(), position: Number(form.get("position") || 0) };
  if (!row.name) return;
  if (id) await db().from("checkpoints").update(row).eq("id", id);
  else await db().from("checkpoints").insert(row);
  revalidatePath("/admin/checkpoints");
}
async function remove(form: FormData) {
  "use server";
  await requireAdmin("super");
  await db().from("checkpoints").delete().eq("id", String(form.get("id"))); // scans at it cascade-delete
  revalidatePath("/admin/checkpoints");
}

const inp = "rounded border border-fg/30 bg-white px-2 py-1.5 text-sm";

export default async function Page() {
  await requireAdmin("super");
  const { data } = await db().from("checkpoints").select("*").order("position");
  return (
    <div className="flex max-w-xl flex-col gap-3">
      <h1 className="m-0 font-display text-3xl font-extrabold">Photo walk checkpoints</h1>
      <p className="m-0 text-sm text-fg-3">Students are scanned at each checkpoint when boarding the bus. Deleting a checkpoint also deletes its scans.</p>
      {(data ?? []).map((c) => (
        <form key={c.id} action={save} className="flex gap-2">
          <input type="hidden" name="id" value={c.id} />
          <input name="position" type="number" defaultValue={c.position} className={inp + " w-16"} />
          <input name="name" defaultValue={c.name} className={inp + " flex-1"} />
          <button className="btn btn-rust px-3 py-1.5 text-sm">Save</button>
          <button formAction={remove} className="btn border border-err bg-transparent px-3 py-1.5 text-sm text-err">Delete</button>
        </form>
      ))}
      <form action={save} className="mt-3 flex gap-2">
        <input name="position" type="number" defaultValue={(data?.length ?? 0) + 1} className={inp + " w-16"} />
        <input name="name" placeholder="New checkpoint (e.g. Purana Qila)" required className={inp + " flex-1"} />
        <button className="btn btn-rust px-3 py-1.5 text-sm">Add</button>
      </form>
    </div>
  );
}
