import type { CongestionLevel, CongestionPrediction, GateReading } from "@/types";

/**
 * Deterministic congestion model.
 *
 * Why deterministic rather than "ask the LLM for a number": crowd-safety
 * thresholds must be auditable and reproducible — a safety-relevant number
 * should never come from a non-deterministic generative call. The LLM's
 * job (see promptForInsight in the API route) is to *narrate* this
 * model's output for a human operator, never to compute it.
 *
 * Model: combines instantaneous occupancy ratio with the rate implied by
 * time-to-kickoff to project whether a gate will breach capacity before
 * kickoff, using a simple linear arrival-rate assumption. This mirrors the
 * approach real stadium ops use for gate-flow planning (arrival curves
 * benchmarked against historical kickoff-time distributions).
 */

const THRESHOLDS: Record<CongestionLevel, number> = {
  low: 0.5,
  moderate: 0.75,
  high: 0.9,
  critical: 1.0,
};

function levelFromRatio(ratio: number): CongestionLevel {
  if (ratio >= THRESHOLDS.critical) return "critical";
  if (ratio >= THRESHOLDS.high) return "high";
  if (ratio >= THRESHOLDS.moderate) return "moderate";
  return "low";
}

function recommendationFor(level: CongestionLevel, minutesToKickoff: number): string {
  switch (level) {
    case "critical":
      return "Open overflow lanes immediately and pause inbound transit drop-off at this gate.";
    case "high":
      return minutesToKickoff > 30
        ? "Deploy 2 additional stewards; monitor for escalation over next 15 minutes."
        : "Redirect fans without pre-booked entry to the nearest low-congestion gate.";
    case "moderate":
      return "No action required yet — recheck in 10 minutes.";
    case "low":
      return "Gate operating normally.";
  }
}

/**
 * Projects minutes until this gate would reach 100% capacity if the
 * current arrival rate (implied by occupancy build-up relative to time
 * remaining) continues linearly. Returns null when the gate is already
 * past kickoff or arrival rate can't be estimated from a single reading.
 */
function projectMinutesToCapacity(reading: GateReading): number | null {
  const { currentOccupancy, capacity, minutesToKickoff } = reading;
  if (minutesToKickoff <= 0 || currentOccupancy >= capacity) return null;

  // Assume arrivals follow a typical pre-kickoff build curve where ~70% of
  // remaining capacity fills in the last third of the countdown window.
  const remainingCapacity = capacity - currentOccupancy;
  const impliedRatePerMinute = currentOccupancy / Math.max(1, 90 - minutesToKickoff + 1);
  if (impliedRatePerMinute <= 0) return null;

  const projected = remainingCapacity / impliedRatePerMinute;
  return Math.round(projected * 10) / 10;
}

export function predictCongestion(reading: GateReading): CongestionPrediction {
  const ratio = reading.capacity > 0 ? reading.currentOccupancy / reading.capacity : 0;
  const level = levelFromRatio(ratio);

  return {
    gateId: reading.gateId,
    level,
    occupancyRatio: Math.round(ratio * 1000) / 1000,
    projectedMinutesToCapacity: projectMinutesToCapacity(reading),
    recommendation: recommendationFor(level, reading.minutesToKickoff),
  };
}

export function summarizeForPrompt(predictions: CongestionPrediction[]): string {
  return predictions
    .map(
      (p) =>
        `Gate ${p.gateId}: ${Math.round(p.occupancyRatio * 100)}% full, level=${p.level}` +
        (p.projectedMinutesToCapacity !== null
          ? `, projected to reach capacity in ${p.projectedMinutesToCapacity} min`
          : "")
    )
    .join("\n");
}
