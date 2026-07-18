import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetToken = vi.fn();
vi.mock("next-auth/jwt", () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args),
}));

const { middleware } = await import("@/middleware");

function makeRequest(pathname: string, method = "GET") {
  return new NextRequest(new URL(pathname, "http://localhost"), { method });
}

describe("middleware auth gating", () => {
  beforeEach(() => {
    mockGetToken.mockReset();
  });

  it("does NOT gate /api/crowd — it backs the public crowd-intelligence page", async () => {
    mockGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/api/crowd/predict", "POST"));
    // NextResponse.next() carries no special status/location; anything
    // other than a redirect/401 here means the request passed through.
    expect(res.headers.get("location")).toBeNull();
    expect(res.status).not.toBe(401);
  });

  it("returns a JSON 401 (never a redirect) for an unauthenticated API call to a protected route", async () => {
    mockGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/api/ops/alerts", "POST"));
    expect(res.status).toBe(401);
    expect(res.headers.get("location")).toBeNull();
    const body = await res.json();
    expect(body.error).toMatch(/authentication required/i);
  });

  it("redirects an unauthenticated page navigation to the app's own branded /login (not NextAuth's default page)", async () => {
    mockGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/dashboard"));
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/login");
    expect(location).not.toContain("/api/auth/signin");
  });

  it("returns 403 JSON for an authenticated non-staff user on a staff-only API route", async () => {
    mockGetToken.mockResolvedValue({ role: "fan" });
    const res = await middleware(makeRequest("/api/ops/alerts", "POST"));
    expect(res.status).toBe(403);
  });

  it("allows an authenticated staff user through to the dashboard", async () => {
    mockGetToken.mockResolvedValue({ role: "organizer" });
    const res = await middleware(makeRequest("/dashboard"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it("fails closed (401 JSON, not a crash) if token decoding throws", async () => {
    mockGetToken.mockRejectedValue(new Error("boom"));
    const res = await middleware(makeRequest("/api/ops/alerts", "POST"));
    expect(res.status).toBe(401);
  });
});
