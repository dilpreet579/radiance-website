import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

export type Admin = { email: string; role: "scanner" | "super" };

export async function authClient() {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => { try { list.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch {} },
    },
  });
}

export async function getAdmin(): Promise<Admin | null> {
  const { data } = await (await authClient()).auth.getUser();
  if (!data.user) return null;
  const { data: row } = await db().from("admins").select("email,role").eq("user_id", data.user.id).maybeSingle();
  return row as Admin | null;
}

// Super admin can do everything a scanner can.
export async function requireAdmin(role: "scanner" | "super" = "scanner"): Promise<Admin> {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  if (role === "super" && a.role !== "super") redirect("/admin/scan");
  return a;
}
