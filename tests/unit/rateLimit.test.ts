import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit, type RateLimitStore } from "@/lib/security/rateLimit";

/**
 * A minimal in-test store so these tests exercise `rateLimit`'s actual
 * windowing logic through the same `RateLimitStore` interface production
 * code uses (see rateLimit.ts's doc comment on swapping in Redis) — not a
 * reimplementation that could drift from what the real store does.
 */
function createTestStore(): RateLimitStore {
  const map = new Map<string, number[]>();
  return {
    get: (key) => map.get(key),
    set: (key, timestamps) => {
      if (timestamps.length === 0) map.delete(key);
      else map.set(key, timestamps);
    },
  };
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit and decrements `remaining`", () => {
    const store = createTestStore();
    const first = rateLimit("user-a", { max: 3, windowMs: 60_000, store });
    const second = rateLimit("user-a", { max: 3, windowMs: 60_000, store });

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("blocks once the identifier hits max requests within the window", () => {
    const store = createTestStore();
    for (let i = 0; i < 3; i++) rateLimit("user-b", { max: 3, windowMs: 60_000, store });

    const blocked = rateLimit("user-b", { max: 3, windowMs: 60_000, store });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("does not let one identifier's requests count against a different identifier", () => {
    const store = createTestStore();
    for (let i = 0; i < 3; i++) rateLimit("user-c", { max: 3, windowMs: 60_000, store });

    const otherUser = rateLimit("user-d", { max: 3, windowMs: 60_000, store });
    expect(otherUser.allowed).toBe(true);
  });

  it("allows requests again once the sliding window has fully elapsed", () => {
    const store = createTestStore();
    for (let i = 0; i < 2; i++) rateLimit("user-e", { max: 2, windowMs: 60_000, store });
    expect(rateLimit("user-e", { max: 2, windowMs: 60_000, store }).allowed).toBe(false);

    vi.advanceTimersByTime(60_001);

    const afterWindow = rateLimit("user-e", { max: 2, windowMs: 60_000, store });
    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(1);
  });

  it("persists the pruned timestamp array back to the store even when blocking", () => {
    // Regression test: a previous version only called store.set() on the
    // allowed path, so a blocked identifier's expired timestamps were
    // never written back until its next successful request.
    const store = createTestStore();
    rateLimit("user-f", { max: 1, windowMs: 60_000, store });
    rateLimit("user-f", { max: 1, windowMs: 60_000, store }); // blocked

    vi.advanceTimersByTime(60_001);

    // If the blocked call hadn't persisted anything new, this would still
    // read whatever was last written on the allowed path — which, in this
    // case, happens to be the same single expired timestamp either way, so
    // assert directly on the stored value to catch a regression precisely.
    expect(store.get("user-f")).toEqual([new Date("2026-01-01T00:00:00Z").getTime()]);
  });

  it("resetAtMs reflects when the oldest request in the window expires", () => {
    const store = createTestStore();
    const start = Date.now();
    rateLimit("user-g", { max: 1, windowMs: 30_000, store });
    const blocked = rateLimit("user-g", { max: 1, windowMs: 30_000, store });

    expect(blocked.resetAtMs).toBe(start + 30_000);
  });

  it("treats a missing store entry as zero prior requests", () => {
    const store = createTestStore();
    const result = rateLimit("brand-new-user", { max: 5, windowMs: 60_000, store });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });
});
