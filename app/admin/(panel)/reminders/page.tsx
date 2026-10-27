import Link from "next/link";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { bodyWithNotes, istToday, recipientsFor, sendDay, sendTest, type Template } from "@/lib/reminders";
import { fillTemplate } from "@/lib/email";
import { AForm } from "@/components/admin/Toast";
import { Badge, Card, CardGrid, CardHead, Field, FieldGrid, PageTitle, btnP, btnS, input } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = {
  "2026-10-26": "26 Oct · Inaugural",
  "2026-10-27": "27 Oct · Photography",
  "2026-10-28": "28 Oct · Filmmaking",
  "2026-10-29": "29 Oct · Motion Design",
  "2026-10-30": "30 Oct · Graphic Design",
  "2026-10-31": "31 Oct · Photo Walk",
};

const WHO: Record<Template["audience"], string> = {
  nit: "all NIT Delhi registrants",
  nit_and_workshop: "all NIT Delhi registrants plus outside students who selected this workshop",
  walk_selected: "students selected for the photo walk",
};

async function act(form: FormData) {
  "use server";
  const a = await requireAdmin("super");
  const op = String(form.get("op")), day = String(form.get("day")), g = (k: string) => String(form.get(k) ?? "").trim();
  const sb = db();

  if (op === "test") {
    await sendTest(day, a.email);
    revalidatePath("/admin/reminders");
    revalidatePath("/admin/reminders", "page");
    return `Test email sent to ${a.email}`;
  }

  const { error } = await sb.from("reminder_templates").update({
    subject: g("subject"),
    venue: g("venue"),
    body: g("body"),
    notes: g("notes"),
  }).eq("day", day);
  if (error) throw new Error(error.message);

  // If organizer checked "apply to all upcoming event days", update those venues too
  if (form.get("apply_all_venues") === "true" && g("venue")) {
    await sb.from("reminder_templates").update({ venue: g("venue") }).gte("day", day);
  }

  if (op === "send") {
    const r = await sendDay(day);
    revalidatePath("/admin/reminders");
    revalidatePath("/admin/reminders", "page");
    return r.failed
      ? `Sent ${r.sent}, ${r.failed} failed (see log)`
      : `Sent to ${r.sent} recipients${r.skipped ? ` (${r.skipped} already had it)` : ""}`;
  }

  revalidatePath("/admin/reminders");
  revalidatePath("/admin/reminders", "page");
  revalidatePath("/admin", "layout");
}

export default async function Page({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  const { day: want } = await searchParams;
  const { data: tpls } = await db().from("reminder_templates").select("*").order("day");
  const list = (tpls ?? []) as Template[];

  // Automatically pick requested day, or today's active event, or nearest upcoming day, or first day
  const today = istToday();
  const t = (want ? list.find((x) => x.day === want) : null)
    ?? list.find((x) => x.day === today)
    ?? list.find((x) => x.day >= today)
    ?? list[0];

  if (!t) return <PageTitle title="Reminder emails" sub="No templates found. Re-run supabase/schema.sql." />;

  const [recips, { data: log }] = await Promise.all([
    recipientsFor(t),
    db().from("reminder_log").select("email,ok,error,test,sent_at").eq("day", t.day).order("sent_at", { ascending: false }).limit(40),
  ]);

  const sample = { name: "Aarav Sharma", token: "RAD26-0001", venue: t.venue, event: t.event };
  const preview = `Subject: ${fillTemplate(t.subject, sample)}\n\n${fillTemplate(bodyWithNotes(t), sample)}\n\nTitle Sponsor: Bharat Petroleum`;
  const lines = (log ?? []).map((l) =>
    `${new Date(l.sent_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })} · ${l.test ? "Test" : l.ok ? "Sent" : "Failed"} · ${l.email}${l.ok ? "" : ` · ${l.error}`}`);

  return (
    <>
      <PageTitle title="Reminder emails" sub="Sent automatically at 9:30 AM IST on each event day. Edit the template before it goes out." />
      <div className="flex flex-wrap gap-2">
        {list.map((x) => {
          const isSelected = x.day === t.day;
          const isToday = x.day === today;
          return (
            <Link
              key={x.day}
              href={`/admin/reminders?day=${x.day}`}
              prefetch={false}
              className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] px-4 text-[15px] font-semibold transition-colors ${
                isSelected ? "border-gold bg-gold !text-bg" : "border-fg/30 !text-fg hover:border-fg/60"
              }`}
            >
              <span>{LABEL[x.day] ?? x.day}</span>
              {isToday && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isSelected ? "bg-bg text-gold" : "bg-gold text-bg"
                }`}>
                  Today
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <CardGrid>
        <Card>
          <AForm
            key={t.day}
            action={act}
            className="flex flex-col gap-4"
            confirm={{ send: `Send this reminder now to ${recips.length} recipients?` }}
          >
            <input type="hidden" name="day" value={t.day} />
            <CardHead
              title={`Template · ${LABEL[t.day] ?? t.day}`}
              sub={`Recipients: ${WHO[t.audience]} (${recips.length}).`}
              right={<Badge>9:30 AM IST</Badge>}
            />
            <FieldGrid key={t.day}>
              <Field label="Subject" wide>
                <input key={`subj-${t.day}`} name="subject" defaultValue={t.subject} className={input} />
              </Field>
              <Field label="Venue inside campus" wide hint="Where attendees should report for this specific event.">
                <div className="flex flex-col gap-2">
                  <input key={`venue-${t.day}`} name="venue" defaultValue={t.venue} className={input} />
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-fg-3 select-none">
                    <input type="checkbox" name="apply_all_venues" value="true" className="accent-gold h-3.5 w-3.5 rounded" />
                    <span>Also apply this venue to all upcoming event days</span>
                  </label>
                </div>
              </Field>
              <Field label="Body" wide hint="Placeholders: {name} {token} {venue} {event}">
                <textarea key={`body-${t.day}`} name="body" rows={4} defaultValue={t.body} className={`${input} resize-y leading-normal`} />
              </Field>
              <Field label="Extra notes" wide hint="Refreshments, SRHC bus info and similar.">
                <textarea key={`notes-${t.day}`} name="notes" rows={4} defaultValue={t.notes} className={`${input} resize-y leading-normal`} />
              </Field>
            </FieldGrid>
            <div className="flex flex-wrap gap-2">
              <button name="op" value="save" className={btnS}>Save</button>
              <button name="op" value="test" className={btnS}>Send test email</button>
              <button name="op" value="send" className={btnP}>Send now</button>
            </div>
          </AForm>
        </Card>
        <div className="flex flex-col gap-3.5">
          <Card>
            <CardHead title="Preview" sub="Rendered with a sample student. Save to refresh." />
            <div className="whitespace-pre-wrap rounded-lg border border-fg/20 bg-[#fff8ec] p-4 text-[15px] leading-[1.55]">{preview}</div>
          </Card>
          <Card>
            <CardHead title="Send log" />
            <div className="flex flex-col text-sm">
              {(lines.length ? lines : ["Nothing sent yet."]).map((l, i) => (
                <div key={i} className="break-words border-t border-fg/[.12] py-2 font-mono">{l}</div>
              ))}
            </div>
          </Card>
        </div>
      </CardGrid>
    </>
  );
}
