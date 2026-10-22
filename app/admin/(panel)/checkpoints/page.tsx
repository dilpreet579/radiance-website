import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { moveRow, nextPosition } from "@/lib/reorder";
import { AForm } from "@/components/admin/Toast";
import { Badge, Card, CardGrid, CardHead, Field, PageTitle, btnD, btnP, btnS, input } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

async function act(form: FormData) {
  "use server";
  await requireAdmin("super");
  const op = String(form.get("op")), id = String(form.get("id") ?? "");
  const sb = db();
  if (op === "add") {
    await sb.from("checkpoints").insert({ name: "New location", position: await nextPosition("checkpoints") });
  } else if (op === "delete") {
    await sb.from("checkpoints").delete().eq("id", id); // its scans cascade-delete
  } else if (op === "up" || op === "down") {
    await moveRow("checkpoints", id, op === "up" ? -1 : 1);
  } else {
    const name = String(form.get("name") ?? "").trim();
    if (!name) throw new Error("Give the checkpoint a name");
    await sb.from("checkpoints").update({ name }).eq("id", id);
  }
  revalidatePath("/admin/checkpoints");
}

const MSG = { save: "Saved", add: "Checkpoint added", delete: "Removed", up: "Moved up", down: "Moved down" };

export default async function Page() {
  const sb = db();
  const [{ data: cps }, { data: scans }] = await Promise.all([
    sb.from("checkpoints").select("id,name").order("position").order("id"),
    sb.from("scans").select("checkpoint_id").eq("session_key", "walk"),
  ]);
  const boarded = (id: string) => (scans ?? []).filter((s) => s.checkpoint_id === id).length;
  return (
    <>
      <PageTitle title="Photo walk checkpoints" sub="Locations are revealed later. Expect 4–5. Students are scanned when boarding the bus at each one."
        actions={<AForm action={act} messages={MSG}><button name="op" value="add" className={btnP}>Add checkpoint</button></AForm>} />
      <CardGrid>
        {(cps ?? []).map((c, i) => (
          <Card key={c.id}>
            <AForm action={act} messages={MSG} confirm={{ delete: "Remove this checkpoint and all scans recorded at it?" }} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={c.id} />
              <CardHead title={`Checkpoint ${i + 1}`} right={<Badge>{boarded(c.id)} boarded</Badge>} />
              <Field label="Location name"><input name="name" defaultValue={c.name} className={input} /></Field>
              <div className="flex flex-wrap gap-2">
                <button name="op" value="save" className={btnP}>Save</button>
                <button name="op" value="up" className={btnS}>↑ Up</button>
                <button name="op" value="down" className={btnS}>↓ Down</button>
                <button name="op" value="delete" className={btnD}>Remove</button>
              </div>
            </AForm>
          </Card>
        ))}
      </CardGrid>
      {(cps ?? []).length === 0 && <p className="m-0 text-fg-3">No checkpoints yet.</p>}
    </>
  );
}
