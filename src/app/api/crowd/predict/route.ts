import { NextRequest, NextResponse } from "next/server";
import { predictCongestion } from "@/features/crowd-intelligence/lib/predictCongestion";
import { crowdPredictRequestSchema } from "@/lib/security/sanitize";
import { rateLimit } from "@/lib/security/rateLimit";

export const runtime = "edge"; // pure computation, no provider I/O — edge is fine and fast

/**
 * POST /api/crowd/predict
 * Accepts one or more gate readings and returns deterministic congestion
 * predictions (see predictCongestion.ts for why this is not LLM-generated).
 * Intentionally public (no auth required): it backs the public
 * /crowd-intelligence page, which any fan can view, same as Fan Assistant.
 * Only the aggregated Ops Dashboard (/dashboard, /api/ops) is staff-gated
 * in middleware.ts. Rate limiting below is the abuse control for this route.
 */
export async function POST(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limit = rateLimit(`crowd:${identifier}`, { max: 60 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const readings = Array.isArray(body) ? body : [body];
  const results = [];

  for (const reading of readings) {
    const parsed = crowdPredictRequestSchema.safeParse(reading);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid gate reading", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    results.push(
      predictCongestion({
        gateId: parsed.data.gateId,
        label: parsed.data.gateId,
        currentOccupancy: parsed.data.currentOccupancy,
        capacity: parsed.data.capacity,
        minutesToKickoff: parsed.data.minutesToKickoff,
      })
    );
  }

  return NextResponse.json({ predictions: results });
}
