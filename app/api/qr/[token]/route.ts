import QRCode from "qrcode";

// Public QR PNG for a token. Encodes only the token string; no data lookup.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^RAD26-\d{4,}$/.test(token)) return new Response("bad token", { status: 400 });
  const png = await QRCode.toBuffer(token, { margin: 1, width: 360, errorCorrectionLevel: "M" });
  return new Response(new Uint8Array(png), { headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000, immutable" } });
}
