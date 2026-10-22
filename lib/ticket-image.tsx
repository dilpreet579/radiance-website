import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import sharp from "sharp";

// Renders the on-screen ticket (app/register/RegisterForm.tsx TicketView) to a PNG for the email.
// Email clients can't do web fonts, positioned notches or background images, so the exact design is drawn as an image.
// Laid out at the site's 380px card width and drawn at 2x for sharpness.

export type TicketImageInfo = { token: string; name: string; type: string; institute: string; roll: string; workshops: string[]; sponsor: { name: string; logo_url: string } };

const asset = (p: string) => readFile(path.join(process.cwd(), "assets", p));
const dataUri = (buf: Buffer, mime: string) => `data:${mime};base64,${buf.toString("base64")}`;

// The renderer draws transparent/palette PNGs blank or clipped, so every image is flattened onto the colour it sits on and re-encoded as opaque PNG.
const flat = (buf: Buffer, bg: string, width?: number) => sharp(buf).resize(width).flatten({ background: bg }).png().toBuffer();
const ab = (b: Buffer) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;

// Sponsor logo is a remote URL of unknown format; fit it to the strip height (18px at 2x), and drop it (name only) if it can't be fetched.
async function sponsorLogo(url: string) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const img = await sharp(Buffer.from(await res.arrayBuffer())).resize({ height: 36 }).flatten({ background: C.bg }).png().toBuffer({ resolveWithObject: true });
    return { src: dataUri(img.data, "image/png"), w: Math.round(img.info.width / 2) };
  } catch {
    return null;
  }
}

const C = { panel: "#430b10", cream: "#f4e9d9", cream2: "#fbf5ea", fg: "#2a0b0c", fg2: "#4a1e1a", fg3: "#6b3a33", bg: "#2e070b", ink: "#1e0407", rust: "#a82e17" };
const label = { display: "flex", fontFamily: "DM Mono", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: C.fg3 } as const;

export async function renderTicketPng(t: TicketImageInfo): Promise<Buffer> {
  const [bricolage, mono400, mono500, h400, h600, h700, pattern, logo, qrPng, sLogo] = await Promise.all([
    asset("fonts/bricolage-800.ttf"), asset("fonts/dmmono-400.ttf"), asset("fonts/dmmono-500.ttf"),
    asset("fonts/hanken-400.ttf"), asset("fonts/hanken-600.ttf"), asset("fonts/hanken-700.ttf"),
    asset("ticket-pattern.jpg"), readFile(path.join(process.cwd(), "public/radiance26-logo.png")).then((b) => flat(b, C.cream, 648)),
    QRCode.toBuffer(t.token, { errorCorrectionLevel: "M", margin: 0, width: 252, color: { dark: "#2A0B0C", light: "#0000" } }).then((b) => flat(b, C.cream2)),
    sponsorLogo(t.sponsor.logo_url),
  ]);

  const card = (
    <div style={{ display: "flex", position: "relative", width: 380 + 12, paddingRight: 12, paddingBottom: 12 }}>
      <div style={{ position: "absolute", left: 12, top: 12, width: 380, bottom: 0, background: C.ink, borderRadius: 18 }} />
      <div style={{ display: "flex", flexDirection: "column", position: "relative", width: 380, background: C.cream, borderRadius: 18, color: C.fg, fontFamily: "Hanken" }}>
        {/* No overflow:hidden on the card: the renderer clips images inside it wrongly, so the corners are rounded on the header and footer instead. */}
        <div style={{ display: "flex", padding: "16px 18px", borderRadius: "18px 18px 0 0", backgroundColor: C.panel, backgroundImage: `url(${dataUri(pattern, "image/jpeg")})`, backgroundSize: "380px 200px" }}>
          <div style={{ display: "flex", width: "100%", background: C.cream, borderRadius: 6, padding: "4px 10px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUri(logo, "image/png")} width={324} height={72} alt="" />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", padding: "22px 26px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={label}>Entry ticket</div>
            <div style={{ display: "flex", background: C.rust, color: C.cream, borderRadius: 999, padding: "4px 12px", fontFamily: "DM Mono", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t.type}</div>
          </div>
          <div style={{ display: "flex", fontFamily: "Bricolage", fontWeight: 800, fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.01em", marginBottom: 8 }}>{t.name}</div>
          <div style={{ display: "flex", fontSize: 15, color: C.fg2 }}>{t.institute} · {t.roll}</div>
        </div>

        <div style={{ display: "flex", position: "relative", margin: "0 14px", borderTop: "2px dashed rgba(42,11,12,0.3)" }}>
          <div style={{ position: "absolute", left: -14, top: -13, width: 12, height: 24, borderRadius: "0 12px 12px 0", background: C.panel }} />
          <div style={{ position: "absolute", right: -14, top: -13, width: 12, height: 24, borderRadius: "12px 0 0 12px", background: C.panel }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", padding: "22px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 144, height: 144, padding: 8, marginRight: 20, borderRadius: 8, border: "1.5px solid rgba(42,11,12,0.2)", background: C.cream2 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUri(qrPng, "image/png")} width={126} height={126} alt="" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={label}>Token ID</div>
            <div style={{ display: "flex", fontFamily: "DM Mono", fontWeight: 500, fontSize: 24, letterSpacing: "0.04em", margin: "4px 0" }}>{t.token}</div>
            <div style={{ display: "flex", fontSize: 13, color: C.fg3 }}>Show at every event</div>
          </div>
        </div>

        {t.workshops.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", padding: "0 26px 22px" }}>
            <div style={{ ...label, marginBottom: 8 }}>Workshops</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {t.workshops.map((w) => (
                <div key={w} style={{ display: "flex", border: "1.5px solid rgba(42,11,12,0.3)", borderRadius: 999, padding: "5px 14px", fontSize: 14, fontWeight: 600, marginRight: 8, marginBottom: 8 }}>{w}</div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", background: C.bg, color: C.cream, padding: "12px 26px", borderRadius: "0 0 18px 18px", fontFamily: "DM Mono", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <div style={{ display: "flex" }}>Title Sponsor</div>
          {sLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sLogo.src} width={sLogo.w} height={18} style={{ margin: "0 12px" }} alt="" />
          )}
          <div style={{ display: "flex", marginLeft: sLogo ? 0 : 12 }}>{t.sponsor.name}</div>
        </div>
      </div>
    </div>
  );

  // Satori needs a fixed canvas: draw tall at 2x, then trim the empty transparent space below the card.
  const res = new ImageResponse(
    <div style={{ display: "flex", alignItems: "flex-start", width: 392, height: 1000, transform: "scale(2)", transformOrigin: "top left" }}>{card}</div>,
    {
      width: 392 * 2, height: 1000 * 2,
      fonts: [
        { name: "Bricolage", data: ab(bricolage), weight: 800, style: "normal" },
        { name: "DM Mono", data: ab(mono400), weight: 400, style: "normal" },
        { name: "DM Mono", data: ab(mono500), weight: 500, style: "normal" },
        { name: "Hanken", data: ab(h400), weight: 400, style: "normal" },
        { name: "Hanken", data: ab(h600), weight: 600, style: "normal" },
        { name: "Hanken", data: ab(h700), weight: 700, style: "normal" },
      ],
    },
  );
  return sharp(Buffer.from(await res.arrayBuffer())).trim().png({ compressionLevel: 9 }).toBuffer();
}
