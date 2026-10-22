import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import ScanClient from "./ScanClient";

export const dynamic = "force-dynamic";

export default async function Scan() {
  await requireAdmin();
  const [{ data: sessions }, { data: checkpoints }] = await Promise.all([
    db().from("sessions").select("key,label").order("position"),
    db().from("checkpoints").select("id,name").order("position"),
  ]);
  return <ScanClient sessions={sessions ?? []} checkpoints={checkpoints ?? []} />;
}
