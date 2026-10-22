import { db } from "./db";

export type ScanResult =
  | { status: "ok" | "already"; name: string; token: string; at: string }
  | { status: "ineligible"; name: string; token: string; reason: string }
  | { status: "notfound" | "error"; message: string };

// "26" -> RAD26-0026, "rad26-26" -> RAD26-0026, full token passes through.
export function normToken(raw: string) {
  const t = raw.trim().toUpperCase();
  if (/^\d{1,6}$/.test(t)) return "RAD26-" + t.padStart(4, "0");
  return t;
}

// Scanner sessions that need a checkpoint on top of the session key.
export const NEEDS_CHECKPOINT = "walk";

export async function recordScan(rawToken: string, sessionKey: string, checkpointId: string | null, adminEmail: string): Promise<ScanResult> {
  const token = normToken(rawToken);
  const sb = db();
  const { data: reg } = await sb.from("registrations").select("id,name,is_nit,workshops,walk_selected,token").eq("token", token).maybeSingle();
  if (!reg) return { status: "notfound", message: `No ticket found for ${token}` };

  const { data: session } = await sb.from("sessions").select("key,label,nit_only").eq("key", sessionKey).maybeSingle();
  if (!session) return { status: "error", message: "Pick a session first" };
  if (sessionKey === NEEDS_CHECKPOINT && !checkpointId) return { status: "error", message: "Pick a checkpoint for the photo walk" };

  const no = (reason: string): ScanResult => ({ status: "ineligible", name: reg.name, token, reason });
  if (session.nit_only && !reg.is_nit) return no(`${session.label} is for NIT Delhi students only`);
  if (sessionKey === "walk" && !reg.walk_selected) return no("Not selected for the photo walk");
  if (!reg.is_nit && ["photo", "film", "motion", "graphic"].includes(sessionKey) && !reg.workshops.includes(sessionKey)) {
    return no("Did not register for this workshop");
  }

  const { error } = await sb.from("scans").insert({ registration_id: reg.id, session_key: sessionKey, checkpoint_id: checkpointId, admin_email: adminEmail });
  if (!error) return { status: "ok", name: reg.name, token, at: new Date().toISOString() };
  if (error.code !== "23505") return { status: "error", message: error.message };

  // unique violation: already scanned. Show when.
  let q = sb.from("scans").select("scanned_at").eq("registration_id", reg.id).eq("session_key", sessionKey);
  q = checkpointId ? q.eq("checkpoint_id", checkpointId) : q.is("checkpoint_id", null);
  const { data: prev } = await q.maybeSingle();
  return { status: "already", name: reg.name, token, at: prev?.scanned_at ?? new Date().toISOString() };
}
