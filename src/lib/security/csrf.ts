import { randomBytes, timingSafeEqual } from "crypto";

/**
 * Double-submit-cookie CSRF protection for state-changing routes.
 * NextAuth's session cookie is httpOnly/sameSite=lax which already blocks
 * most cross-site cookie replay, but we add an explicit token check on
 * mutating routes (POST/PUT/DELETE) as defense-in-depth, per the brief's
 * explicit CSRF requirement.
 */

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function verifyCsrfToken(cookieToken: string | undefined, headerToken: string | undefined): boolean {
  if (!cookieToken || !headerToken) return false;
  if (cookieToken.length !== headerToken.length) return false;

  const a = Buffer.from(cookieToken);
  const b = Buffer.from(headerToken);
  return timingSafeEqual(a, b);
}
