"use server";

import QRCode from "qrcode";
import { db } from "@/lib/db";
import { sendTicket } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { WORKSHOP_OPTIONS } from "@/lib/content";

export type RegInput = {
  name: string; gender: string; nit: boolean; instName: string; roll: string;
  year: string; branch: string; phone: string; email: string;
  workshops: string[]; consents: Record<string, boolean>;
};
export type Ticket = { token: string; name: string; type: string; institute: string; roll: string; email: string; workshops: string[]; qrPath: string; qrBox: number };
export type RegResult =
  | { ok: true; dup: boolean; ticket: Ticket; emailed: boolean }
  | { ok: false; errors: Record<string, string> };

const WS_NAME = Object.fromEntries(WORKSHOP_OPTIONS.map((w) => [w.key, w.name]));

export async function register(i: RegInput): Promise<RegResult> {
  const s = await getSettings();
  const e: Record<string, string> = {};
  if (!i.name.trim()) e.name = "Enter your full name";
  if (!i.gender) e.gender = "Select one";
  if (!i.nit && !i.instName.trim()) e.instName = "Enter your institute name";
  if (!i.roll.trim()) e.roll = "Enter your roll number";
  if (!i.year) e.year = "Select your year";
  if (!i.branch.trim()) e.branch = "Enter your branch";
  if (i.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid phone number";
  if (!/^\S+@\S+\.\S+$/.test(i.email.trim())) e.email = "Enter a valid email address";
  const ws = i.nit ? [] : i.workshops.filter((w) => w in WS_NAME);
  if (!i.nit && !ws.length) e.ws = "Select at least one workshop";
  const need = (i.nit ? s.consents.nit : s.consents.outside).map((c) => c.key);
  if (need.some((k) => !i.consents[k])) e.consent = "Please accept all undertakings to continue";
  if (Object.keys(e).length) return { ok: false, errors: e };

  const { data, error } = await db().rpc("register_student", {
    p_name: i.name, p_gender: i.gender, p_is_nit: i.nit, p_institute: i.instName, p_roll: i.roll,
    p_year: i.year, p_branch: i.branch, p_phone: i.phone, p_email: i.email,
    p_workshops: ws, p_consents: Object.fromEntries(need.map((k) => [k, true])), p_seat_cap: s.seat_cap,
  });
  if (error) {
    console.error("register_student", error);
    return { ok: false, errors: { form: "Something went wrong. Please try again." } };
  }
  if (data.error === "full") {
    return { ok: false, errors: { ws: `${WS_NAME[data.workshop] ?? "A workshop"} is now full. Please deselect it.` } };
  }

  const r = data.reg as { token: string; name: string; is_nit: boolean; institute: string; roll: string; email: string; workshops: string[] };
  const qr = QRCode.create(r.token, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  let qrPath = "";
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(x, y)) qrPath += `M${x} ${y}h1v1h-1z`;

  const ticket: Ticket = {
    token: r.token, name: r.name, type: r.is_nit ? "Universal Pass" : "Workshop Pass", institute: r.institute,
    roll: r.roll, email: r.email, workshops: r.workshops.map((w) => WS_NAME[w] ?? w), qrPath, qrBox: n,
  };
  let emailed = true;
  try {
    await sendTicket(r.email, ticket, data.dup);
  } catch (err) {
    console.error("ticket email", err);
    emailed = false; // ticket is still shown on screen
  }
  return { ok: true, dup: data.dup, ticket, emailed };
}
