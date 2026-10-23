import { istToday, sendDay } from "@/lib/reminders";
import { resendUnsentTickets } from "@/lib/tickets";

// Vercel Cron: 04:00 UTC = 09:30 IST. Vercel sends "Authorization: Bearer $CRON_SECRET".
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("unauthorized", { status: 401 });
  const day = istToday();
  return Response.json({ day, ...(await sendDay(day)), tickets: await resendUnsentTickets() });
}
