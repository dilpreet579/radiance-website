import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Registrations() {
  await requireAdmin("super");
  const { data } = await db().from("registrations").select("token,name,institute,roll,year,branch,phone,email,is_nit,workshops,created_at").order("created_at", { ascending: false });
  const th = "px-3 py-2 text-left text-xs uppercase tracking-wide text-fg-3";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="m-0 font-display text-3xl font-extrabold">Registrations ({data?.length ?? 0})</h1>
        <a href="/admin/export?type=registrations" className="btn btn-rust px-5 py-2.5 text-sm">Export CSV</a>
      </div>
      <div className="overflow-x-auto rounded-xl border border-fg/10 bg-cream-2">
        <table className="w-full text-sm">
          <thead><tr>{["Token", "Name", "Institute", "Roll", "Year", "Branch", "Phone", "Email", "Type", "Workshops"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
          <tbody>
            {(data ?? []).map((r) => (
              <tr key={r.token} className="border-t border-fg/10">
                <td className="px-3 py-2 font-mono">{r.token}</td><td className="px-3 py-2 font-semibold">{r.name}</td><td className="px-3 py-2">{r.institute}</td>
                <td className="px-3 py-2">{r.roll}</td><td className="px-3 py-2">{r.year}</td><td className="px-3 py-2">{r.branch}</td>
                <td className="px-3 py-2">{r.phone}</td><td className="px-3 py-2">{r.email}</td><td className="px-3 py-2">{r.is_nit ? "Universal" : "Workshop"}</td>
                <td className="px-3 py-2">{r.workshops.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
