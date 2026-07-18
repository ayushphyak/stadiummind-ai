# Security

This document maps each brief requirement to its concrete implementation and
file location, plus the residual risk that a hackathon-scale implementation
doesn't fully close.

| Requirement | Implementation | File |
|---|---|---|
| Input validation | Zod schemas on every API route | `lib/security/sanitize.ts` |
| Prompt injection protection | Pattern-based guard + system-prompt data-tagging + never granting the model tool access to sensitive actions | `lib/ai/promptGuard.ts`, `lib/ai/prompts.ts` |
| XSS prevention | DOMPurify strip on any HTML rendering path; React's default escaping for all text; strict CSP (`script-src 'self'`) | `lib/security/sanitizeHtml.ts`, `next.config.js` |
| CSRF protection | NextAuth `sameSite=lax` session cookie + explicit double-submit token check available for mutating routes | `lib/security/csrf.ts` |
| SQL injection prevention | No raw SQL string concatenation anywhere in this repo; documented requirement to use parameterized queries / an ORM when `docs/DATABASE.md`'s schema is wired up; identifier allowlist regex as an extra layer | `lib/security/sanitize.ts` (`isSafeIdentifier`) |
| API rate limiting | Sliding-window limiter, per-route configurable | `lib/security/rateLimit.ts`, used in `app/api/chat/route.ts`, `app/api/crowd/predict/route.ts` |
| Authentication | NextAuth credentials provider, JWT sessions | `lib/auth/config.ts` |
| Authorization | Role check (`organizer`/`volunteer`) enforced in edge middleware before the route handler runs | `middleware.ts` |
| Secure environment variables | All secrets read from `process.env`, never hard-coded; `.env.example` documents required vars without values; `server-only` import guards the AI client from ever being bundled client-side | `lib/ai/client.ts`, `.env.example` |
| Secure API routes | Runtime chosen per route's needs (edge for pure compute, node for streaming fetch); no route trusts client-supplied role/identity without validating the session | `app/api/*/route.ts` |
| Sanitized AI inputs | Every user string is validated by Zod *then* passed through `guardUserInput` before reaching a prompt | `app/api/chat/route.ts` |
| Secure file uploads | Not implemented in this slice — no upload feature was in scope for the 3 built modules. If added (e.g. incident photo upload), it must: validate MIME type server-side (never trust the `Content-Type` header alone), enforce a size limit, store outside the web root or in object storage with a randomized key, and re-encode images rather than serving the uploaded bytes directly. |
| HTTPS assumptions | `next.config.js` sets `Strict-Transport-Security`-equivalent expectations via headers; actual TLS termination is Vercel's responsibility in deployment |
| Error handling without leaking secrets | Every route catches provider/DB errors and returns a generic client-safe message; internals go to `console.error` only | `app/api/chat/route.ts` |

## Prompt injection: what's actually covered

The guard in `promptGuard.ts` is explicitly **one layer, not a solution**.
It:
- Truncates and tag-wraps input so the model is told (via the system
  prompt) to treat it as data.
- Pattern-matches a set of known override phrasings and **rejects** (not
  silently rewrites) anything flagged, returning a safe static response
  instead of forwarding the message.
- Is paired with a system prompt that never grants the model any ability to
  take real actions (no function-calling to gate controls, no admin
  tools) — so even a successful injection can only produce *misleading
  text*, not a real-world effect. That containment is the actual security
  boundary; the regex guard is a cheap first filter on top of it.

## Known gaps in this hackathon-scope build

- Demo user store in `lib/auth/config.ts` is in-memory and the password
  check is a placeholder — replace with a real user table + `bcrypt.compare`
  before any real deployment.
- Rate limiter is in-memory (per-instance) — fine for a single Vercel
  function, not for multi-instance production (swap the `RateLimitStore`
  for Upstash Redis, see the interface comment in `rateLimit.ts`).
- CSRF token generation/verification helpers exist but aren't yet wired
  into a specific mutating form, since the built modules (chat, crowd
  predict) are same-origin fetches; wire in before adding any
  cross-origin-callable mutating endpoint.
