/**
 * Sliding-window rate limiter. Uses an in-memory store by default (fine for
 * a single Vercel instance / demo); swap `store` for a Redis-backed
 * implementation (e.g. Upstash) before running multi-instance in
 * production — the interface is designed for that swap to be a one-line
 * change (see `RateLimitStore`).
 */

export interface RateLimitStore {
  get(key: string): number[] | undefined;
  set(key: string, timestamps: number[]): void;
}

class InMemoryStore implements RateLimitStore {
  private map = new Map<string, number[]>();
  get(key: string) {
    return this.map.get(key);
  }
  set(key: string, timestamps: number[]) {
    this.map.set(key, timestamps);
  }
}

const defaultStore = new InMemoryStore();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAtMs: number;
}

export function rateLimit(
  identifier: string,
  {
    windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
    max = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 20),
    store = defaultStore,
  }: { windowMs?: number; max?: number; store?: RateLimitStore } = {}
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const existing = (store.get(identifier) ?? []).filter((ts) => ts > windowStart);

  if (existing.length >= max) {
    return { allowed: false, remaining: 0, resetAtMs: existing[0]! + windowMs };
  }

  existing.push(now);
  store.set(identifier, existing);

  return { allowed: true, remaining: max - existing.length, resetAtMs: now + windowMs };
}
