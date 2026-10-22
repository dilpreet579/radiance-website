import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { moveRow, nextPosition } from "@/lib/reorder";
import { AForm } from "@/components/admin/Toast";
import LogoDrop from "@/components/admin/LogoDrop";
import { Badge, Card, CardGrid, CardHead, Field, FieldGrid, PageTitle, btnD, btnP, btnS, input } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const BUCKET = "sponsor-logos";

async function uploadLogo(file: File): Promise<string> {
  if (file.size > 4 * 1024 * 1024) throw new Error("Logo must be under 4 MB");
  const sb = db();
  await sb.storage.createBucket(BUCKET, { public: true }).catch(() => {}); // already exists is fine
  const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${Date.now()}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw new Error("Upload failed: " + error.message);
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function act(form: FormData) {
  "use server";
  await requireAdmin("super");
  const op = String(form.get("op")), id = String(form.get("id") ?? ""), g = (k: string) => String(form.get(k) ?? "").trim();
  const sb = db();
  if (op === "add") {
    await sb.from("sponsors").insert({ name: "New sponsor", tier: "associate", position: await nextPosition("sponsors") });
  } else if (op === "delete") {
    await sb.from("sponsors").delete().eq("id", id);
  } else if (op === "up" || op === "down") {
    await moveRow("sponsors", id, op === "up" ? -1 : 1);
  } else {
    const row: Record<string, string> = { name: g("name"), tier: g("tier") === "title" ? "title" : "associate", tagline: g("tagline"), link: g("link") };
    const file = form.get("logo");
    if (file instanceof File && file.size > 0) row.logo_url = await uploadLogo(file);
    const { error } = await sb.from("sponsors").update(row).eq("id", id);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/sponsors");
}

const MSG = { save: "Saved", add: "Sponsor added", delete: "Removed", up: "Moved up", down: "Moved down" };

export default async function Page() {
  const { data } = await db().from("sponsors").select("*").order("tier").order("position").order("id");
  return (
    <>
      <PageTitle title="Sponsors" sub="The title sponsor appears in the header, footer, ticket and emails. It always ranks first."
        actions={<AForm action={act} messages={MSG}><button name="op" value="add" className={btnP}>Add sponsor</button></AForm>} />
      <CardGrid>
        {(data ?? []).map((s) => (
          <Card key={s.id}>
            <AForm action={act} messages={MSG} confirm={{ delete: "Remove this sponsor?" }} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={s.id} />
              <CardHead title={s.name || "Untitled"} right={s.tier === "title" ? <Badge>Title sponsor</Badge> : undefined} />
              <LogoDrop current={s.logo_url} />
              <FieldGrid>
                <Field label="Name"><input name="name" defaultValue={s.name} className={input} /></Field>
                <Field label="Tier">
                  <select name="tier" defaultValue={s.tier} className={input}><option value="title">Title sponsor</option><option value="associate">Associate sponsor</option></select>
                </Field>
                <Field label="Tagline" wide><input name="tagline" defaultValue={s.tagline} className={input} /></Field>
                <Field label="Website" wide><input name="link" defaultValue={s.link} placeholder="https://" className={input} /></Field>
              </FieldGrid>
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
    </>
  );
}
