import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { Admin, type AdminDoc } from "@/lib/models/Admin";
import { effectivePermissions, type Permission } from "@/lib/permissions";
import { hashPassword, verifyPassword } from "@/lib/password";

/**
 * Server-side admin authentication.
 * - Passwords: scrypt with per-password salt ("salt:hash", hex encoded).
 * - Sessions: HMAC-signed token stored in an HTTP-only cookie.
 * - Permission checks happen ONLY here (server), never in the browser.
 */

export { hashPassword, verifyPassword };

export const SESSION_COOKIE = "ecrm_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function authSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 8) throw new Error("AUTH_SECRET is not set (see .env.example).");
  return s;
}

// ---------- Session tokens (HMAC-signed "payload.signature") ----------

interface SessionPayload {
  adminId: string;
  email: string;
  exp: number; // unix seconds
}

function sign(data: string): string {
  return createHmac("sha256", authSecret()).update(data).digest("base64url");
}

export function createSessionToken(adminId: string, email: string): string {
  const payload: SessionPayload = {
    adminId,
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.adminId || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------- Cookie helpers ----------

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
}

// ---------- Current admin (server-side) ----------

export interface SessionAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
  isActive: boolean;
}

/** Resolve the authenticated admin from the session cookie, re-checking DB status. */
export async function getSessionAdmin(): Promise<SessionAdmin | null> {
  const store = await cookies();
  const payload = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const admin = (await Admin.findById(payload.adminId).lean()) as AdminDoc | null;
  if (!admin || !admin.isActive) return null; // deactivated admins are logged out everywhere

  return {
    id: String(admin._id),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    permissions: effectivePermissions(admin.role, admin.permissions ?? []),
    isActive: admin.isActive,
  };
}

/** Require a permission inside a route handler. Returns the admin or null (caller 401/403s). */
export async function requirePermission(needed: Permission | Permission[]): Promise<SessionAdmin | null> {
  const admin = await getSessionAdmin();
  if (!admin) return null;
  const list = Array.isArray(needed) ? needed : [needed];
  if (!list.every((p) => admin.permissions.includes(p))) return null;
  return admin;
}
