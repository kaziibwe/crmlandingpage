import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionTokenEdge } from "@/lib/session-edge";

/**
 * First-pass protection for the Administration Portal.
 * Cryptographically validates the session cookie at the edge and redirects
 * unauthenticated visitors to the admin login. Full authorization (DB check
 * + permissions) still happens server-side in the admin layout & every API route.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow the login page itself
  if (pathname === "/eternitycrmadmin/login") return NextResponse.next();

  const payload = await verifySessionTokenEdge(req.cookies.get(SESSION_COOKIE)?.value);
  if (payload) return NextResponse.next();

  const loginUrl = new URL("/eternitycrmadmin/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/eternitycrmadmin/:path*",
};
