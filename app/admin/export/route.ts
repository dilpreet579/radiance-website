import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { CORE } from "@/lib/content";
import { leaderboard, toCsv } from "@/lib/reports";

const ist = (d: string) => new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

// GET /admin/export?type=registrations|leaderboard|shortlist|attendance&session=<key>
export async function GET(req: Request) {
  const a = await getAdmin();
  if (a?.role !== "super") return new Response("forbidden", { status: 403 });
  const u = new URL(req.url);
  const type = u.searchParams.get("type") ?? "";
  const sb = db();
  let rows: (string | number | boolean | null)[][];

  if (type === "registrations") {
    const { data } = await sb.from("registrations").select("*").order("created_at");
    rows = [["Token", "Name", "Gender", "Institute", "Roll", "Year", "Branch", "Phone", "Email", "Type", "Workshops", "Registered at (IST)"],
      ...(data ?? []).map((r) => [r.token, r.name, r.gender, r.institute, r.roll, r.year, r.branch, r.phone, r.email, r.is_nit ? "Universal" : "Workshop", r.workshops.join("|"), ist(r.created_at)])];
  } else if (type === "leaderboard" || type === "shortlist") {
    const all = await leaderboard();
    const list = type === "shortlist" ? all.filter((r) => r.selected) : all;
    rows = [["Token", "Name", "Roll", "Phone", "Branch", "Year", "Sessions attended", ...CORE, "Engagement", "Remarks", "Selected"],
      ...list.map((r) => [r.token, r.name, r.roll, r.phone, r.branch, r.year, r.count, ...CORE.map((k) => (r.attended.includes(k) ? "Y" : "")), r.engagement, r.remarks, r.selected ? "Y" : ""])];
  } else if (type === "attendance") {
    const session = u.searchParams.get("session") ?? "";
    const { data } = await sb.from("scans").select("scanned_at,admin_email,registrations(token,name,roll,institute,phone,email),checkpoints(name)").eq("session_key", session).order("scanned_at");
    rows = [["Token", "Name", "Roll", "Institute", "Phone", "Email", "Checkpoint", "Scanned at (IST)", "Scanned by"],
      ...(data ?? []).map((s) => {
        const r = s.registrations as unknown as { token: string; name: string; roll: string; institute: string; phone: string; email: string };
        const c = s.checkpoints as unknown as { name: string } | null;
        return [r.token, r.name, r.roll, r.institute, r.phone, r.email, c?.name ?? "", ist(s.scanned_at), s.admin_email];
      })];
  } else return new Response("unknown type", { status: 400 });

  return new Response(toCsv(rows), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="radiance-${type}${u.searchParams.get("session") ? "-" + u.searchParams.get("session") : ""}.csv"` },
  });
}
