# Testing Guide

## Strategy

| Layer | Tool | What it covers | Location |
|---|---|---|---|
| Unit | Vitest | Pure functions: prompt guard, congestion model | `tests/unit/` |
| API/Integration | Vitest + mocked AI provider | Route handlers, validation, rate limiting, error mapping | `tests/api/` |
| E2E | Playwright | Full browser flows: navigation, keyboard-only chat submission, skip-link focus order | `tests/e2e/` |

## Mocking AI responses

Never call a real provider in tests — it's slow, costs money, and makes CI
non-deterministic. `tests/api/chat.test.ts` shows the pattern:

```ts
vi.mock("@/lib/ai/client", () => ({
  getAiClient: () => ({
    async *streamChat() {
      yield "mocked chunk";
    },
  }),
  AiProviderError: class AiProviderError extends Error {},
}));
```

Any new AI-backed route should follow this same mock shape so tests stay
fast and offline-runnable.

## Running tests

```bash
npm run test          # unit + api (Vitest)
npm run test:watch    # watch mode while developing
npm run test:e2e      # Playwright — starts the dev server automatically
```

## Coverage priorities for future work

- `predictCongestion` boundary values (exactly at each threshold) —
  partially covered, extend as thresholds evolve.
- Rate limiter window-reset behavior (currently untested — would need
  fake timers).
- NextAuth authorization redirect behavior in `middleware.ts` (requires an
  integration test with a mocked JWT, not yet written).
