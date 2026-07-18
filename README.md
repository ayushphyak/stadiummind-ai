# StadiumMind AI
### An AI-powered FIFA World Cup 2026 Operations Platform

[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-turf.svg)](LICENSE)

> Replace `OWNER/REPO` above with your actual GitHub path once pushed (or delete the CI badge if you'd rather not show it before the first run).

> **Read this first.** This repo is a real, runnable Next.js codebase — not a mockup. To be honest about scope: a hackathon prompt asking for a fully-tested, fully-featured enterprise platform across 6+ modules is realistically weeks of engineering. Rather than produce shallow stubs for everything, this repo implements **three modules end-to-end at production quality** (Fan Assistant, Crowd Intelligence, Operations Dashboard) with real security, streaming AI, and tests — and scaffolds the remaining modules (Volunteer Assistant, Accessibility, Sustainability) as typed, documented extension points that follow the same pattern. See [`docs/STATUS.md`](docs/STATUS.md) for an exact feature-by-feature breakdown of what's implemented vs. scaffolded.

## What's actually working end-to-end

| Module | Status | Notes |
|---|---|---|
| Fan Assistant (AI chat) | ✅ Full | Streaming Gemini/OpenAI responses, prompt-injection guarding, rate limiting, multilingual system prompt |
| Crowd Intelligence | ✅ Full | Deterministic congestion model + AI-generated narrative insight, live heatmap visualization |
| Operations Dashboard | ✅ Full | Aggregates crowd + chat signal into alerts, staff deployment suggestions |
| Auth | ✅ Full (NextAuth, credentials + role-based) | Roles: fan, volunteer, organizer |
| Security middleware | ✅ Full | Rate limiting, input sanitization, CSRF token check, security headers |
| Testing | ✅ Full | Vitest unit + API tests, Playwright E2E smoke test |
| Accessibility | ✅ Full on built screens | WCAG 2.2 AA color contrast, keyboard nav, ARIA, focus rings, prefers-reduced-motion |
| Volunteer Assistant / Sustainability / Sign-language | 🧩 Scaffolded | Typed interfaces + route stubs ready to fill in — same pattern as Fan Assistant |

## Why StadiumMind AI (problem alignment)

FIFA World Cup 2026 spans 16 host cities and the largest tournament footprint in history. The recurring operational failure modes at mega-events are: fans who can't find their way or don't get help in their language, crowd crushes at gates/exits because staff lack predictive visibility, and volunteers who are the first point of contact but have no tools. Each module maps directly to one of those failure modes — see `docs/ARCHITECTURE.md` § "Feature → Problem mapping" for the explicit justification of every AI feature.

## Tech stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js Route Handlers (edge + node runtimes as appropriate)
- **AI:** Provider-agnostic client — Google Gemini by default, OpenAI as a drop-in swap via `AI_PROVIDER` env var
- **Auth:** NextAuth (credentials provider, JWT sessions, role-based authorization)
- **DB:** PostgreSQL via Prisma-style schema (see `docs/DATABASE.md`) — mockable in-memory store for local/dev
- **Testing:** Vitest (unit/API), Playwright (E2E)
- **Deployment:** Vercel

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in AI_PROVIDER, GEMINI_API_KEY or OPENAI_API_KEY, NEXTAUTH_SECRET
npm run dev
```

Runs at `http://localhost:3000`.

```bash
npm run test        # Vitest unit + API tests
npm run test:e2e     # Playwright E2E (requires dev server running)
npm run lint
npm run build
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design, folder structure rationale, data flow, feature→problem mapping
- [`docs/SECURITY.md`](docs/SECURITY.md) — full threat model and mitigations
- [`docs/API.md`](docs/API.md) — API route reference
- [`docs/TESTING.md`](docs/TESTING.md) — testing strategy and how to extend it
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Vercel deployment steps
- [`docs/DATABASE.md`](docs/DATABASE.md) — schema
- [`docs/STATUS.md`](docs/STATUS.md) — honest feature-by-feature completion status

## Design direction

Visual identity is "stadium at night, floodlights on": deep pitch-navy backgrounds, a turf-green primary accent, floodlight-white typography, and amber/red reserved exclusively for live operational alerts so they stay meaningful. Display type is Space Grotesk (technical, sporty); body is Inter; live data uses IBM Plex Mono so numbers stay legible and won't jitter as they update. Full token system in `tailwind.config.ts`.
