/**
 * Wraps fetch with a timeout so a slow/hanging network request fails fast
 * with a clear error instead of leaving the UI stuck on a loading state
 * indefinitely. Combine the caller's own AbortSignal (e.g. from unmount
 * cleanup) with the timeout by passing it through `signal`.
 */
export class FetchTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = "FetchTimeoutError";
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 15_000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  // If the caller also passed a signal (e.g. to cancel on unmount), abort
  // our controller when theirs fires too, so either source can cancel.
  const callerSignal = init.signal;
  const onCallerAbort = () => controller.abort();
  callerSignal?.addEventListener("abort", onCallerAbort);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted && !callerSignal?.aborted) {
      throw new FetchTimeoutError(timeoutMs);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
    callerSignal?.removeEventListener("abort", onCallerAbort);
  }
}
