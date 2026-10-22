import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Radiance 2026 <onboarding@resend.dev>";
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export type SponsorInfo = { name: string; logo_url: string };

// Dark strip like the on-screen ticket's footer; logo shown only when one is uploaded.
const footer = (s: SponsorInfo) =>
  `<div style="margin-top:24px;background:#2e070b;color:#f4e9d9;border-radius:8px;padding:12px 16px;font-size:12px;letter-spacing:.08em;text-transform:uppercase">Title Sponsor ${
    s.logo_url ? `<img src="${esc(s.logo_url)}" alt="" height="22" style="height:22px;vertical-align:middle;margin:0 8px">` : "· "
  }<b>${esc(s.name)}</b> · Radiance 2026, NIT Delhi</div>`;

// Full HTML document (doctype, charset, title): well-formed markup scores better with spam filters than a bare <div>.
const shell = (inner: string, s: SponsorInfo, title = "Radiance 2026") =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head><body style="margin:0;background:#f4e9d9">` +
  `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f4e9d9;color:#2a0b0c">${inner}${footer(s)}</div></body></html>`;

// Always send a plain-text part with the HTML: HTML-only mail is a classic spam signal.
export async function sendMail(to: string, subject: string, html: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");
  if (FROM.includes("resend.dev") && process.env.NODE_ENV === "production") console.warn("EMAIL_FROM is still the Resend sandbox sender; verify a domain.");
  const { error } = await new Resend(key).emails.send({ from: FROM, to, subject, html, text, replyTo: process.env.EMAIL_REPLY_TO || undefined });
  if (error) throw new Error(error.message);
}

export type TicketInfo = { token: string; name: string; type: string; institute: string; roll: string; workshops: string[]; sponsor: SponsorInfo };

export function sendTicket(to: string, t: TicketInfo, dup = false) {
  const ws = t.workshops.length ? `<p style="margin:8px 0"><b>Workshops:</b> ${t.workshops.map(esc).join(", ")}</p>` : "";
  const text = [
    "Radiance 2026 · NIT Delhi",
    dup ? "You have already registered. Here is your ticket again." : "You are registered.",
    "",
    `${t.name} (${t.institute}, ${t.roll})`,
    t.type + (t.workshops.length ? ` · Workshops: ${t.workshops.join(", ")}` : ""),
    `Token ID: ${t.token}`,
    `QR code: ${siteUrl()}/api/qr/${encodeURIComponent(t.token)}`,
    "",
    "Take a screenshot of this ticket or keep this email handy; you'll need to show the QR / token at every event.",
    "",
    `Title Sponsor: ${t.sponsor.name}`,
  ].join("\n");
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
      <p style="font-size:14px">Take a screenshot of this ticket or keep this email handy; you'll need to show the QR / token at every event.</p>`, t.sponsor, "Your Radiance 2026 ticket"),
    text,
  );
}

export function fillTemplate(tpl: string, v: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
}

export const reminderHtml = (body: string, s: SponsorInfo) =>
  shell(body.split("\n").map((l) => (l.trim() ? `<p style="margin:0 0 12px">${esc(l)}</p>` : "")).join(""), s, "Radiance 2026 reminder");
