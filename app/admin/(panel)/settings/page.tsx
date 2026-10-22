import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getSettings, setSetting, type Consent } from "@/lib/settings";
import { AForm } from "@/components/admin/Toast";
import { Card, CardGrid, CardHead, Field, FieldGrid, PageTitle, btnP, input } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

async function save(form: FormData) {
  "use server";
  await requireAdmin("super");
  const s = await getSettings();
  const g = (k: string) => String(form.get(k) ?? "").trim();
  await setSetting("seat_cap", Math.max(0, Number(g("seat_cap")) || s.seat_cap));
  await setSetting("venue", g("venue") || s.venue);
  await setSetting("notes", [
    { k: "Refreshments", t: g("refreshments") },
    { k: "SRHC campus bus", t: g("srhc") },
  ]);
  const cons = (list: Consent[], prefix: string) => list.map((c) => ({ key: c.key, t: c.t, d: g(`${prefix}_${c.key}`) || c.d }));
  await setSetting("consents", { nit: cons(s.consents.nit, "nit"), outside: cons(s.consents.outside, "out") });
  revalidatePath("/", "layout");
}

const area = `${input} resize-y leading-normal`;

export default async function Page() {
  const s = await getSettings();
  const note = (k: string) => s.notes.find((n) => n.k === k)?.t ?? "";
  return (
    <>
      <PageTitle title="Settings" sub="Seat caps, inaugural venue, notes shown on the website and consent wording."
        actions={<button form="settings-form" className={btnP}>Save changes</button>} />
      <AForm id="settings-form" action={save} messages={{ save: "Settings saved" }}>
        <CardGrid>
          <Card>
            <CardHead title="Seats and inaugural venue" />
            <FieldGrid>
              <Field label="Outside seats per workshop"><input name="seat_cap" type="number" min={0} defaultValue={s.seat_cap} className={input} /></Field>
              <Field label="Inaugural venue" hint="Shown on the Inaugural page only. Reminder emails use their own venue, set under Reminders."><input name="venue" defaultValue={s.venue} className={input} /></Field>
            </FieldGrid>
          </Card>
          <Card>
            <CardHead title="Info notes" sub="Shown on the schedule, workshops and inaugural pages." />
            <FieldGrid>
              <Field label="SRHC campus bus note" wide><textarea name="srhc" rows={4} defaultValue={note("SRHC campus bus")} className={area} /></Field>
              <Field label="Refreshments note" wide><textarea name="refreshments" rows={4} defaultValue={note("Refreshments")} className={area} /></Field>
            </FieldGrid>
          </Card>
          <Card>
            <CardHead title="Consent text · NIT Delhi" />
            <FieldGrid>
              {s.consents.nit.map((c) => <Field key={c.key} label={c.t} wide><textarea name={`nit_${c.key}`} rows={4} defaultValue={c.d} className={area} /></Field>)}
            </FieldGrid>
          </Card>
          <Card>
            <CardHead title="Consent text · outside students" />
            <FieldGrid>
              {s.consents.outside.map((c) => <Field key={c.key} label={c.t} wide><textarea name={`out_${c.key}`} rows={4} defaultValue={c.d} className={area} /></Field>)}
            </FieldGrid>
          </Card>
        </CardGrid>
      </AForm>
    </>
  );
}
