import { db } from "@/lib/db";
import { authClient, requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import ScanClient from "./ScanClient";

export const dynamic = "force-dynamic";

async function signOut() {
  "use server";
  await (await authClient()).auth.signOut();
  redirect("/admin/login");
}

export default async function Scan() {
  const a = await requireAdmin();
  const [{ data: sessions }, { data: checkpoints }] = await Promise.all([
    db().from("sessions").select("key,label").order("position"),
    db().from("checkpoints").select("id,name").order("position"),
  ]);
  return <ScanClient email={a.email} isSuper={a.role === "super"} sessions={sessions ?? []} checkpoints={checkpoints ?? []} signOut={signOut} />;
}
