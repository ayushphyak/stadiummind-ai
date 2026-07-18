# Deployment (Vercel)

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the repo.
3. Set environment variables (Project Settings → Environment Variables),
   matching `.env.example`:
   - `AI_PROVIDER` (`gemini` or `openai`)
   - `GEMINI_API_KEY` or `OPENAI_API_KEY`
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your production URL
   - `DATABASE_URL` — if wiring up real persistence (see `docs/DATABASE.md`)
4. Deploy. Vercel auto-detects Next.js 15 App Router — no build config
   needed beyond the defaults.
5. Verify `GET /api/health` returns `200` on the deployed URL before
   pointing real traffic at it.

## If GitHub checks show repeated Vercel failures

- Ensure this repository is linked to only the intended Vercel project. If
  multiple linked projects exist, each one reports a separate required check
  and any failing project keeps GitHub checks red.
- Confirm the linked project uses the repo root as the Root Directory and the
  default Next.js commands (`npm install`, `npm run build`).
- Confirm required env vars are present for the target environment:
  `AI_PROVIDER`, provider API key (`GEMINI_API_KEY` or `OPENAI_API_KEY`),
  `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.

## Runtime notes

- `app/api/chat/route.ts` uses `runtime = "nodejs"` (needs Node's `fetch`
  streaming semantics for the provider call).
- `app/api/crowd/predict/route.ts` and `app/api/health/route.ts` use
  `runtime = "edge"` for lower latency on pure computation.
- Rate limiting is in-memory per the note in `docs/SECURITY.md` — fine for
  a single-region, low-instance-count demo deployment; move to Upstash
  Redis before scaling to multiple regions/instances.

## Repo size constraint

The brief requires the GitHub repo stay under 10 MB. This scaffold has no
binary assets, no bundled fonts (loaded from Google Fonts CDN), and no
committed `node_modules` or build output — `.gitignore` excludes all of
those. Keep it that way: prefer CDN-hosted or `next/image`-optimized
external images over committing raster assets.
