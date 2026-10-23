import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { countUnsentTickets, resendUnsentTickets } from "@/lib/tickets";
import { PageTitle, btnP } from "@/components/admin/ui";
import ResendTickets from "./ResendTickets";
import RegTable, { type Reg } from "./RegTable";

export const dynamic = "force-dynamic";

async function resend(confirm: string) {
  "use server";
  await requireAdmin("super");
  if (confirm !== "RESEND") return "Type RESEND to confirm";
  const r = await resendUnsentTickets();
  revalidatePath("/admin/registrations");
  return r.sent + r.failed === 0 ? "No unsent tickets" : `Sent ${r.sent}${r.failed ? `, ${r.failed} failed (check email provider)` : ""}${r.left ? `, ${r.left} still unsent, click again` : ""}`;
}

export default async function Registrations() {
  const unsent = await countUnsentTickets();
  const { data } = await db()
    .from("registrations")
    .select("id,token,name,institute,roll,year,branch,is_nit,created_at,ticket_sent_at")
    .order("created_at", { ascending: false });

  const rows: Reg[] = (data ?? []).map((r) => ({
    id: r.id,
    token: r.token,
    name: r.name,
    inst: r.institute,
    roll: r.roll,
    year: r.year,
    branch: r.branch,
    nit: r.is_nit,
    at: new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }),
    sent: r.ticket_sent_at ? new Date(r.ticket_sent_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }) : "",
  }));

  return (
    <>
      <PageTitle title="Registrations" sub="All registered students." actions={
        <div className="flex flex-wrap items-center gap-3">
          {unsent > 0 && <ResendTickets unsent={unsent} action={resend} />}
          <a href="/admin/export?type=registrations" className={btnP}>Export CSV</a>
        </div>
      } />
      <RegTable rows={rows} />
    </>
  );
}
