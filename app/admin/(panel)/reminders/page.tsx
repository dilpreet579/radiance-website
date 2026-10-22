import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendDay, sendTest } from "@/lib/reminders";

export const dynamic = "force-dynamic";

async function save(form: FormData) {
  "use server";
  await requireAdmin("super");
  await db().from("reminder_templates").update({
    subject: String(form.get("subject")), body: String(form.get("body")), event: String(form.get("event")), venue: String(form.get("venue")),
  }).eq("day", String(form.get("day")));
  revalidatePath("/admin/reminders");
}
async function sendNow(form: FormData) {
  "use server";
  await requireAdmin("super");
  await sendDay(String(form.get("day")));
  revalidatePath("/admin/reminders");
}
async function test(form: FormData) {
  "use server";
  const a = await requireAdmin("super");
  const to = String(form.get("to") || a.email);
  try { await sendTest(String(form.get("day")), to); } catch (e) { console.error("test reminder", e); }
  revalidatePath("/admin/reminders");
}

const inp = "w-full rounded border border-fg/30 bg-white px-2 py-1.5 text-sm";

export default async function Page() {
  await requireAdmin("super");
  const [{ data: tpls }, { data: log }] = await Promise.all([
    db().from("reminder_templates").select("*").order("day"),
    db().from("reminder_log").select("day,email,ok,error,test,sent_at").order("sent_at", { ascending: false }).limit(60),
  ]);
  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 font-display text-3xl font-extrabold">Morning reminders (9:30 AM IST)</h1>
      <p className="m-0 text-sm text-fg-3">Placeholders: {"{name} {token} {venue} {event}"}. Sent automatically by the daily cron; &quot;Send now&quot; skips anyone already emailed for that day.</p>
      {(tpls ?? []).map((t) => (
        <form key={t.day} action={save} className="grid gap-2 rounded-xl border border-fg/10 bg-cream-2 p-4">
          <input type="hidden" name="day" value={t.day} />
          <div className="font-display text-lg font-extrabold">{t.day} <span className="text-sm font-normal text-fg-3">· audience: {t.audience}{t.workshop_key ? ` + ${t.workshop_key} outside` : ""}</span></div>
          <input name="event" defaultValue={t.event} placeholder="Event name + time" className={inp} />
          <input name="venue" defaultValue={t.venue} placeholder="Exact venue inside campus" className={inp} />
          <input name="subject" defaultValue={t.subject} className={inp} />
          <textarea name="body" rows={5} defaultValue={t.body} className={inp} />
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn btn-rust px-4 py-2 text-sm">Save</button>
            <button formAction={sendNow} className="btn btn-gold px-4 py-2 text-sm">Send now</button>
            <input name="to" type="email" placeholder="test to (default: you)" className={inp + " max-w-56"} />
            <button formAction={test} className="btn border border-fg/40 bg-transparent px-4 py-2 text-sm">Send test</button>
          </div>
        </form>
      ))}
      <h2 className="m-0 font-display text-xl font-extrabold">Recent sends</h2>
      <div className="overflow-x-auto rounded-xl border border-fg/10 bg-cream-2">
        <table className="w-full text-sm">
          <tbody>
            {(log ?? []).map((l, i) => (
              <tr key={i} className="border-t border-fg/10 first:border-0">
                <td className="px-3 py-1.5">{l.day}</td><td className="px-3 py-1.5">{l.email}</td>
                <td className={`px-3 py-1.5 font-semibold ${l.ok ? "text-green-700" : "text-err"}`}>{l.ok ? (l.test ? "test sent" : "sent") : `failed: ${l.error}`}</td>
                <td className="px-3 py-1.5 text-fg-3">{new Date(l.sent_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
