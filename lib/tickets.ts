import { db } from "./db";
import { sendTicket } from "./email";
import { getTitleSponsor } from "./sponsors";
import { WORKSHOP_OPTIONS } from "./content";

const WS_NAME = Object.fromEntries(WORKSHOP_OPTIONS.map((w) => [w.key, w.name]));

export const markTicketSent = (token: string) => db().from("registrations").update({ ticket_sent_at: new Date().toISOString() }).eq("token", token);

export const countUnsentTickets = async () =>
  (await db().from("registrations").select("id", { count: "exact", head: true }).is("ticket_sent_at", null)).count ?? 0;

// Emails the ticket to every registration that never got one. Capped per call so a serverless request stays inside its time limit; run again for the rest.
export async function resendUnsentTickets(limit = 40): Promise<{ sent: number; failed: number; left: number }> {
  const sb = db();
  const [{ data }, sponsor] = await Promise.all([
    sb.from("registrations").select("token,name,is_nit,institute,roll,email,workshops").is("ticket_sent_at", null).order("created_at").limit(limit),
    getTitleSponsor(),
  ]);
  let sent = 0, failed = 0;
  for (const r of data ?? []) {
    try {
      await sendTicket(r.email, {
        token: r.token, name: r.name, type: r.is_nit ? "Universal Pass" : "Workshop Pass", institute: r.institute, roll: r.roll,
        workshops: r.workshops.map((w: string) => WS_NAME[w] ?? w), sponsor: { name: sponsor.name, logo_url: sponsor.logo_url },
      });
      await markTicketSent(r.token);
      sent++;
    } catch (e) {
      console.error("resend ticket", r.token, e);
      failed++;
    }
  }
  return { sent, failed, left: await countUnsentTickets() };
}
