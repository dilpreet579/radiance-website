import { db } from "@/lib/db";
import { PageTitle, btnP } from "@/components/admin/ui";
import RegTable, { type Reg } from "./RegTable";

export const dynamic = "force-dynamic";

export default async function Registrations() {
  const { data } = await db().from("registrations").select("token,name,institute,roll,year,branch,is_nit,created_at").order("created_at", { ascending: false });
  const rows: Reg[] = (data ?? []).map((r) => ({
    token: r.token, name: r.name, inst: r.institute, roll: r.roll, year: r.year, branch: r.branch, nit: r.is_nit,
    at: new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }),
  }));
  return (
    <>
      <PageTitle title="Registrations" sub="All registered students." actions={<a href="/admin/export?type=registrations" className={btnP}>Export CSV</a>} />
      <RegTable rows={rows} />
    </>
  );
}
