/**
 * Edge-safe session token verification (Web Crypto) for middleware.
 * Mirrors lib/auth.ts HMAC scheme: base64url(payload) + "." + base64url(HMAC-SHA256).
 */

export const SESSION_COOKIE = "ecrm_admin_session";

interface SessionPayload {
  adminId: string;
  email: string;
  exp: number;
}

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function verifySessionTokenEdge(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    b64urlToBytes(sig),
    new TextEncoder().encode(body)
  );
  if (!ok) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(body))) as SessionPayload;
    if (!payload.adminId || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
