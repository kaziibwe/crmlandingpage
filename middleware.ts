import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionTokenEdge } from "@/lib/session-edge";

/**
 * First-pass protection for the Administration Portal.
 *
 * HARDENED: the handler can never throw, so MIDDLEWARE_INVOCATION_FAILED is
 * impossible. On any unexpected failure it lets the request through — the
 * server-rendered admin layout re-checks auth in the Node runtime
 * (getSessionAdmin) and redirects to /eternitycrmadmin/login when the session
 * is not genuinely valid. Middleware is a fast-path UX optimization, not the
 * security boundary.
 */
export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    // Always allow the login page itself
    if (pathname === "/eternitycrmadmin/login") return NextResponse.next();

    const payload = await verifySessionTokenEdge(req.cookies.get(SESSION_COOKIE)?.value);
    if (payload) return NextResponse.next();

    const loginUrl = new URL("/eternitycrmadmin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  } catch {
    // Never break the page on an unexpected middleware error:
    // fail open here; the server layout enforces the real check.
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/eternitycrmadmin/:path*",
};
