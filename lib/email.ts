import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Radiance 2026 <onboarding@resend.dev>";
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const FOOTER = `<div style="margin-top:24px;padding-top:12px;border-top:1px solid #e5d6c0;font-size:12px;color:#6b3a33">Title Sponsor: Bharat Petroleum · Radiance 2026, NIT Delhi</div>`;

const shell = (inner: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f4e9d9;color:#2a0b0c">${inner}${FOOTER}</div>`;

export async function sendMail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");
  const { error } = await new Resend(key).emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(error.message);
}

export type TicketInfo = { token: string; name: string; type: string; institute: string; roll: string; workshops: string[] };

export function sendTicket(to: string, t: TicketInfo, dup = false) {
  const ws = t.workshops.length ? `<p style="margin:8px 0"><b>Workshops:</b> ${t.workshops.map(esc).join(", ")}</p>` : "";
  return sendMail(
    to,
    "Your Radiance 2026 ticket",
    shell(`
      <h2 style="margin:0 0 4px">Radiance 2026</h2>
      <p style="margin:0 0 16px;color:#6b3a33">${dup ? "You have already registered. Here is your ticket again." : "You are registered."}</p>
      <div style="background:#fff;border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:22px;font-weight:800">${esc(t.name)}</div>
        <div style="color:#6b3a33;font-size:14px">${esc(t.institute)} · ${esc(t.roll)}</div>
        <div style="margin:6px 0"><b>${esc(t.type)}</b></div>
        <img src="${siteUrl()}/api/qr/${encodeURIComponent(t.token)}" width="180" height="180" alt="QR ${esc(t.token)}" style="display:block;margin:12px auto">
        <div style="font-family:monospace;font-size:20px;letter-spacing:.04em">${esc(t.token)}</div>
      </div>
      ${ws}
      <p style="font-size:14px">Take a screenshot of this ticket or keep this email handy; you'll need to show the QR / token at every event.</p>`),
  );
}

export function fillTemplate(tpl: string, v: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
}

export const reminderHtml = (body: string) =>
  shell(body.split("\n").map((l) => (l.trim() ? `<p style="margin:0 0 12px">${esc(l)}</p>` : "")).join(""));
