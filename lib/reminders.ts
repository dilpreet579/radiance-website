import QRCode from "qrcode";
import { db } from "./db";
import { fillTemplate, reminderHtml, sendMail, type SponsorInfo } from "./email";
import { getTitleSponsor } from "./sponsors";

export type Template = { day: string; audience: "nit" | "nit_and_workshop" | "walk_selected"; workshop_key: string | null; subject: string; body: string; notes: string; event: string; venue: string };
type Reg = { name: string; email: string; token: string };

export const istToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD

export async function recipientsFor(t: Pick<Template, "audience" | "workshop_key">): Promise<Reg[]> {
  const { data } = await db().from("registrations").select("name,email,token,is_nit,workshops,walk_selected");
  return (data ?? []).filter((r) => {
    if (t.audience === "walk_selected") return r.is_nit && r.walk_selected;
    if (t.audience === "nit") return r.is_nit;
    return r.is_nit || (!!t.workshop_key && r.workshops.includes(t.workshop_key));
  });
}

export const bodyWithNotes = (t: Pick<Template, "body" | "notes">) => (t.notes?.trim() ? `${t.body}\n\n${t.notes.trim()}` : t.body);

export const renderReminder = async (t: Template, r: Reg, sponsor: SponsorInfo) => {
  const v = { name: r.name, token: r.token, venue: t.venue, event: t.event };
  const body = fillTemplate(bodyWithNotes(t), v);
  const qr = await QRCode.toBuffer(r.token, { errorCorrectionLevel: "M", margin: 1, width: 240, color: { dark: "#2A0B0C", light: "#FBF5EA" } });
  return {
    subject: fillTemplate(t.subject, v),
    text: body,
    html: reminderHtml(body, sponsor, { day: t.day, event: t.event, venue: t.venue, token: r.token }),
    attachments: [{ filename: `${r.token}.png`, content: qr, contentId: "qr" }],
  };
};

// Sends to everyone for the day who has not already received it (safe to re-run / cron retry).
export async function sendDay(day: string): Promise<{ sent: number; failed: number; skipped: number }> {
  const sb = db();
  const { data: t } = await sb.from("reminder_templates").select("*").eq("day", day).maybeSingle();
  if (!t) return { sent: 0, failed: 0, skipped: 0 };
  const [list, { data: done }] = await Promise.all([
    recipientsFor(t),
    sb.from("reminder_log").select("email").eq("day", day).eq("ok", true).eq("test", false),
  ]);
  const already = new Set((done ?? []).map((d) => d.email));
  const sponsor = await getTitleSponsor();
  let sent = 0, failed = 0, skipped = 0;
  for (const r of list) {
    if (already.has(r.email)) { skipped++; continue; }
    try {
      const m = await renderReminder(t, r, sponsor);
      await sendMail(r.email, m.subject, m.html, m.text, m.attachments);
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
  const m = await renderReminder(t, { name: "Test Student", email: to, token: "RAD26-0000" }, await getTitleSponsor());
  await sendMail(to, "[TEST] " + m.subject, m.html, m.text, m.attachments);
  await db().from("reminder_log").insert({ day, email: to, ok: true, test: true });
}
