import { db } from "./db";
import { fillTemplate, reminderHtml, sendMail } from "./email";

type Template = { day: string; audience: "nit" | "nit_and_workshop" | "walk_selected"; workshop_key: string | null; subject: string; body: string; event: string; venue: string };
type Reg = { name: string; email: string; token: string };

export const istToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD

async function recipients(t: Template): Promise<Reg[]> {
  const q = db().from("registrations").select("name,email,token,is_nit,workshops,walk_selected");
  const { data } = await q;
  return (data ?? []).filter((r) => {
    if (t.audience === "walk_selected") return r.is_nit && r.walk_selected;
    if (t.audience === "nit") return r.is_nit;
    return r.is_nit || (!!t.workshop_key && r.workshops.includes(t.workshop_key));
  });
}

const render = (t: Template, r: Reg) => {
  const v = { name: r.name, token: r.token, venue: t.venue, event: t.event };
  return { subject: fillTemplate(t.subject, v), html: reminderHtml(fillTemplate(t.body, v)) };
};

// Sends to everyone for the day who has not already received it (safe to re-run / cron retry).
export async function sendDay(day: string): Promise<{ sent: number; failed: number; skipped: number }> {
  const sb = db();
  const { data: t } = await sb.from("reminder_templates").select("*").eq("day", day).maybeSingle();
  if (!t) return { sent: 0, failed: 0, skipped: 0 };
  const [list, { data: done }] = await Promise.all([
    recipients(t),
    sb.from("reminder_log").select("email").eq("day", day).eq("ok", true).eq("test", false),
  ]);
  const already = new Set((done ?? []).map((d) => d.email));
  let sent = 0, failed = 0, skipped = 0;
  for (const r of list) {
    if (already.has(r.email)) { skipped++; continue; }
    const m = render(t, r);
    try {
      await sendMail(r.email, m.subject, m.html);
      await sb.from("reminder_log").insert({ day, email: r.email, ok: true });
      sent++;
    } catch (e) {
      await sb.from("reminder_log").insert({ day, email: r.email, ok: false, error: String((e as Error).message).slice(0, 300) });
      failed++;
    }
  }
  return { sent, failed, skipped };
}

export async function sendTest(day: string, to: string) {
  const { data: t } = await db().from("reminder_templates").select("*").eq("day", day).maybeSingle();
  if (!t) throw new Error("No template for that day");
  const m = render(t, { name: "Test Student", email: to, token: "RAD26-0000" });
  await sendMail(to, "[TEST] " + m.subject, m.html);
  await db().from("reminder_log").insert({ day, email: to, ok: true, test: true });
}
