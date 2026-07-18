import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require an authenticated session at all.
// NOTE: crowd predictions back the PUBLIC /crowd-intelligence page (linked
// from the homepage exactly like Fan Assistant, with no "Staff" label), so
// they must NOT require auth — only the aggregated Ops Dashboard and its
// /api/ops feed are staff-only. Gating /api/crowd here previously broke
// the public page for every anonymous visitor (see docs/ARCHITECTURE.md
// "Incident: crowd data 500s for anonymous users" for the full writeup).
const PROTECTED_PREFIXES = ["/dashboard", "/api/ops"];
// Routes that additionally require an organizer/volunteer role.
const STAFF_ONLY_PREFIXES = ["/dashboard", "/api/ops"];

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!requiresAuth) return NextResponse.next();

  let token;
  try {
    token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  } catch (err) {
    // Never let a token-decoding failure (e.g. missing/rotated
    // NEXTAUTH_SECRET) surface as a raw crash. Fail closed instead.
    console.error("[middleware] failed to read session token", err);
    token = null;
  }

  if (!token) {
    // API routes must get a JSON 401, never an HTML redirect: redirecting a
    // POST/PUT/DELETE fetch() into NextAuth's HTML sign-in page is what
    // previously crashed NextAuth and surfaced as a raw 500 to callers like
    // HeatmapView. Only browser page navigations get redirected to /login.
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in and try again." },
        { status: 401 }
      );
    }
    const signInUrl = new URL("/login", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const requiresStaff = STAFF_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (requiresStaff && token.role !== "organizer" && token.role !== "volunteer") {
    return NextResponse.json(
      { error: "Forbidden: staff role required" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/ops/:path*"],
};
