# API Reference

All routes return JSON error bodies of the shape `{ "error": string, "details"?: object }`
on failure, with an appropriate HTTP status. Rate-limited routes return `429`
with a `Retry-After` header.

## `POST /api/chat`
Streams a Fan Assistant reply as `text/plain` chunks.

**Auth:** none required (public fan-facing feature).
**Rate limit:** 20 requests / 60s per client IP (configurable via env).

Request body:
```json
{ "message": "Where is the nearest restroom to Section 214?", "locale": "en" }
```

| Field | Type | Notes |
|---|---|---|
| `message` | string, 1–2000 chars | required |
| `locale` | string, e.g. `en`, `es-MX` | optional, defaults to `en` |
| `conversationId` | uuid | optional, reserved for persisted conversation history |

Response: `200` with a streamed text body, or `400`/`429`/`503`/`500` with a JSON error.

## `POST /api/crowd/predict`
Returns deterministic congestion predictions for one or more gate readings.

**Auth:** required — organizer or volunteer role (enforced in `middleware.ts`).
**Rate limit:** 60 requests / 60s per client IP.

Request body (single reading or array):
```json
{ "gateId": "C", "currentOccupancy": 9100, "capacity": 10000, "minutesToKickoff": 45 }
```

Response:
```json
{
  "predictions": [
    {
      "gateId": "C",
      "level": "high",
      "occupancyRatio": 0.91,
      "projectedMinutesToCapacity": 12.4,
      "recommendation": "Deploy 2 additional stewards; monitor for escalation over next 15 minutes."
    }
  ]
}
```

## `GET /api/health`
Unauthenticated liveness check for deployment monitoring.
```json
{ "status": "ok", "service": "stadiummind-ai", "timestamp": "..." }
```

## `POST /api/auth/[...nextauth]`
Standard NextAuth credentials sign-in flow. See `lib/auth/config.ts`.
