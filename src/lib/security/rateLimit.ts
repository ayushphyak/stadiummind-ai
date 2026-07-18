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

// After this many keys are written, sweep the map once and drop any key
// whose newest timestamp is older than STALE_KEY_MS. Without this, a
// long-running Node process (see chat route's "nodejs" runtime) accumulates
// one array per unique identifier forever, even after that IP goes idle —
// an unbounded memory leak. The sweep is amortized (O(1) per call on
// average) rather than a setInterval, since interval timers aren't reliable
// across edge/serverless runtimes.
const SWEEP_EVERY_N_WRITES = 500;
const STALE_KEY_MS = 10 * 60_000;

class InMemoryStore implements RateLimitStore {
  private map = new Map<string, number[]>();
  private writesSinceSweep = 0;

  get(key: string) {
    return this.map.get(key);
  }

  set(key: string, timestamps: number[]) {
    if (timestamps.length === 0) {
      this.map.delete(key);
    } else {
      this.map.set(key, timestamps);
    }
    this.writesSinceSweep += 1;
    if (this.writesSinceSweep >= SWEEP_EVERY_N_WRITES) {
      this.sweep();
    }
  }

  private sweep() {
    this.writesSinceSweep = 0;
    const now = Date.now();
    for (const [key, timestamps] of this.map) {
      const newest = timestamps[timestamps.length - 1] ?? 0;
      if (now - newest > STALE_KEY_MS) this.map.delete(key);
    }
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
    // Persist the pruned (expired-entries-removed) array even when blocking,
    // so a repeatedly-blocked identifier doesn't sit in the store holding
    // stale timestamps until its next successful request.
    store.set(identifier, existing);
    return { allowed: false, remaining: 0, resetAtMs: existing[0]! + windowMs };
  }

  existing.push(now);
  store.set(identifier, existing);

  return { allowed: true, remaining: max - existing.length, resetAtMs: now + windowMs };
}
