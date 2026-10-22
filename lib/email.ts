import { Resend } from "resend";
import { renderTicketPng } from "@/lib/ticket-image";

const FROM = process.env.EMAIL_FROM ?? "Radiance 2026 <onboarding@resend.dev>";
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export type SponsorInfo = { name: string; logo_url: string };

// Dark strip like the on-screen ticket's footer; logo shown only when one is uploaded.
const sponsorStrip = (s: SponsorInfo, extra = "") =>
  `<div style="background:#2e070b;color:#f4e9d9;padding:12px 16px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;${extra}">Title Sponsor ${
    s.logo_url ? `<img src="${esc(s.logo_url)}" alt="" height="22" style="height:22px;vertical-align:middle;margin:0 8px">` : "· "
  }<b>${esc(s.name)}</b> · Radiance 2026, NIT Delhi</div>`;
const footer = (s: SponsorInfo) => sponsorStrip(s, "margin-top:24px;border-radius:8px;");

const MONO = "'Courier New',Courier,monospace";
const logoImg = (extra = "") => `<img src="${siteUrl()}/email-logo.png" width="432" alt="Radiance 2026 · NIT Delhi" style="display:block;width:100%;max-width:432px;height:auto;${extra}">`;

// Full HTML document (doctype, charset, title): well-formed markup scores better with spam filters than a bare <div>.
const shell = (inner: string, s: SponsorInfo, title = "Radiance 2026") =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head><body style="margin:0;background:#f4e9d9">` +
  `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f4e9d9;color:#2a0b0c">${logoImg("margin:0 0 20px;")}${inner}${footer(s)}</div></body></html>`;

// Always send a plain-text part with the HTML: HTML-only mail is a classic spam signal.
export async function sendMail(to: string, subject: string, html: string, text: string, attachments?: { filename: string; content: Buffer; contentId: string }[]) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");
  if (FROM.includes("resend.dev") && process.env.NODE_ENV === "production") console.warn("EMAIL_FROM is still the Resend sandbox sender; verify a domain.");
  const { error } = await new Resend(key).emails.send({ from: FROM, to, subject, html, text, attachments, replyTo: process.env.EMAIL_REPLY_TO || undefined });
  if (error) throw new Error(error.message);
}

export type TicketInfo = { token: string; name: string; type: string; institute: string; roll: string; workshops: string[]; sponsor: SponsorInfo };

const label = `font-family:${MONO};font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6b3a33;`;

// The ticket is normally the exact on-screen design rendered to a PNG (lib/ticket-image.tsx) and attached inline (cid:ticket).
// If that render fails, the card below is the HTML fallback: inline styles and tables only, and no notches since Gmail/Outlook drop positioned elements.
const ticketHtml = (t: TicketInfo, dup: boolean, withImage: boolean) => {
  const ws = t.workshops.length
    ? `<div style="padding:0 26px 22px"><div style="${label}margin-bottom:8px">Workshops</div>${t.workshops
        .map((w) => `<span style="display:inline-block;border:1.5px solid #bfb2a4;border-radius:999px;padding:5px 14px;margin:0 8px 8px 0;font-size:14px;font-weight:bold">${esc(w)}</span>`)
        .join("")}</div>`
    : "";
  return (
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Radiance 2026 ticket</title></head>` +
    `<body style="margin:0;background:#430b10"><div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#f4e9d9">` +
    `<div style="${label}color:#ebb65b">${dup ? "Already registered" : "Registration complete"}</div>` +
    `<h1 style="margin:6px 0 10px;font-size:30px;line-height:1.1;color:#f4e9d9">${dup ? "Your ticket is below" : "You are registered"}</h1>` +
    `<p style="margin:0 0 20px;font-size:16px;line-height:1.4">${dup ? "You have already registered with these details. Here is your ticket again." : "Your ticket is below."}</p>` +
    (withImage
      ? `<img src="cid:ticket" width="380" alt="Radiance 2026 ticket for ${esc(t.name)}" style="display:block;width:100%;max-width:380px;height:auto;border:0">` +
        `<div style="margin-top:12px;font-family:${MONO};font-size:14px;letter-spacing:.04em">Token ID: ${esc(t.token)}</div>`
      : `<div style="background:#f4e9d9;color:#2a0b0c;border-radius:18px;overflow:hidden">` +
    `<div style="background:#430b10;padding:16px 18px"><div style="background:#f4e9d9;border-radius:6px;padding:4px 10px">${logoImg()}</div></div>` +
    `<div style="padding:22px 26px 20px">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="${label}">Entry ticket</td><td align="right"><span style="display:inline-block;background:#a82e17;color:#f4e9d9;border-radius:999px;padding:4px 12px;font-family:${MONO};font-size:11px;letter-spacing:.12em;text-transform:uppercase">${esc(t.type)}</span></td></tr></table>` +
    `<div style="margin-top:10px;font-size:30px;font-weight:800;line-height:1.05;word-break:break-word">${esc(t.name)}</div>` +
    `<div style="margin-top:6px;font-size:15px;color:#4a1e1a">${esc(t.institute)} · ${esc(t.roll)}</div></div>` +
    `<div style="margin:0 14px;border-top:2px dashed #b9ada0"></div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:22px 26px"><tr>` +
    `<td width="144" style="padding-right:20px"><div style="width:128px;height:128px;border:1.5px solid #d4c8ba;border-radius:8px;background:#fbf5ea;padding:8px"><img src="${siteUrl()}/api/qr/${encodeURIComponent(t.token)}" width="128" height="128" alt="QR ${esc(t.token)}" style="display:block;width:128px;height:128px"></div></td>` +
    `<td valign="middle"><div style="${label}">Token ID</div><div style="font-family:${MONO};font-size:22px;font-weight:bold;letter-spacing:.04em;margin:4px 0">${esc(t.token)}</div><div style="font-size:13px;color:#6b3a33">Show at every event</div></td>` +
    `</tr></table>${ws}${sponsorStrip(t.sponsor)}</div>`) +
    `<div style="margin-top:20px;border:1px solid #ebb65b;border-radius:8px;padding:14px 18px;font-size:15px;line-height:1.4">Take a screenshot of this ticket or keep this email handy; you'll need to show the QR / token at every event.</div>` +
    `</div></body></html>`
  );
};

export async function sendTicket(to: string, t: TicketInfo, dup = false) {
  let png: Buffer | null = null;
  try {
    png = await renderTicketPng(t);
  } catch (err) {
    console.error("ticket image render failed, sending HTML ticket", err);
  }
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
    ticketHtml(t, dup, !!png),
    text,
    png ? [{ filename: `radiance-ticket-${t.token}.png`, content: png, contentId: "ticket" }] : undefined,
  );
}

export function fillTemplate(tpl: string, v: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
}

export const reminderHtml = (body: string, s: SponsorInfo) =>
  shell(body.split("\n").map((l) => (l.trim() ? `<p style="margin:0 0 12px">${esc(l)}</p>` : "")).join(""), s, "Radiance 2026 reminder");
