"use server";

import { requireAdmin } from "@/lib/auth";
import { recordScan, type ScanResult } from "@/lib/scan";

export async function scan(token: string, sessionKey: string, checkpointId: string | null): Promise<ScanResult> {
  const a = await requireAdmin();
  return recordScan(token, sessionKey, checkpointId || null, a.email);
}
