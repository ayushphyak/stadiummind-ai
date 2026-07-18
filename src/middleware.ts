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

/**
 * Builds a per-request CSP with a fresh nonce for script-src, instead of
 * the blanket 'unsafe-inline' this previously shipped in next.config.js.
 * 'unsafe-inline' on script-src means any injected <script> tag (e.g. via
 * a stored-XSS bug elsewhere) still executes — the nonce approach means an
 * attacker-injected script simply won't have the per-request nonce and
 * will be blocked by the browser. This is the pattern Next.js's own docs
 * recommend for the App Router: https://nextjs.org/docs/app/guides/content-security-policy
 *
 * style-src keeps 'unsafe-inline' deliberately: React's inline `style={}`
 * attributes (e.g. the live occupancy bar width in HeatmapView) have no
 * nonce mechanism — only <style> elements do — so disallowing it would
 * break legitimate UI rather than stop an attacker, for comparatively low
 * severity (CSS injection alone can't execute arbitrary JS).
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "connect-src 'self' https://generativelanguage.googleapis.com https://api.openai.com",
    "frame-ancestors 'none'",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const applyCsp = (res: NextResponse) => {
    res.headers.set("Content-Security-Policy", csp);
    return res;
  };

  const requiresAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!requiresAuth) {
    return applyCsp(NextResponse.next({ request: { headers: requestHeaders } }));
  }

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
      return applyCsp(
        NextResponse.json(
          { error: "Authentication required. Please sign in and try again." },
          { status: 401 }
        )
      );
    }
    const signInUrl = new URL("/login", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return applyCsp(NextResponse.redirect(signInUrl));
  }

  const requiresStaff = STAFF_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (requiresStaff && token.role !== "organizer" && token.role !== "volunteer") {
    return applyCsp(
      NextResponse.json({ error: "Forbidden: staff role required" }, { status: 403 })
    );
  }

  return applyCsp(NextResponse.next({ request: { headers: requestHeaders } }));
}

export const config = {
  // Run on everything except static assets, so every page gets a CSP
  // nonce — not just the previously-gated /dashboard and /api/ops routes.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
