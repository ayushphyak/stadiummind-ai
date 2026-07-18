import { describe, it, expect } from "vitest";
import { predictCongestion, summarizeForPrompt } from "@/features/crowd-intelligence/lib/predictCongestion";

describe("predictCongestion", () => {
  it("classifies low occupancy correctly", () => {
    const result = predictCongestion({
      gateId: "A",
      label: "Gate A",
      currentOccupancy: 2000,
      capacity: 10000,
      minutesToKickoff: 60,
    });
    expect(result.level).toBe("low");
    expect(result.occupancyRatio).toBeCloseTo(0.2);
  });

  it("classifies critical occupancy at or above capacity", () => {
    const result = predictCongestion({
      gateId: "C",
      label: "Gate C",
      currentOccupancy: 10000,
      capacity: 10000,
      minutesToKickoff: 30,
    });
    expect(result.level).toBe("critical");
    expect(result.recommendation).toMatch(/overflow/i);
  });

  it("classifies high occupancy just under capacity", () => {
    const result = predictCongestion({
      gateId: "C",
      label: "Gate C",
      currentOccupancy: 9100,
      capacity: 10000,
      minutesToKickoff: 45,
    });
    expect(result.level).toBe("high");
  });

  it("returns null projection once kickoff has passed", () => {
    const result = predictCongestion({
      gateId: "D",
      label: "Gate D",
      currentOccupancy: 5000,
      capacity: 10000,
      minutesToKickoff: -5,
    });
    expect(result.projectedMinutesToCapacity).toBeNull();
  });

  it("handles zero capacity without dividing by zero", () => {
    const result = predictCongestion({
      gateId: "X",
      label: "Gate X",
      currentOccupancy: 0,
      capacity: 0,
      minutesToKickoff: 30,
    });
    expect(result.occupancyRatio).toBe(0);
    expect(Number.isFinite(result.occupancyRatio)).toBe(true);
  });

  it("summarizeForPrompt produces a deterministic, parseable summary", () => {
    const predictions = [
      predictCongestion({ gateId: "A", label: "A", currentOccupancy: 10000, capacity: 10000, minutesToKickoff: 20 }),
    ];
    const summary = summarizeForPrompt(predictions);
    expect(summary).toContain("Gate A");
    expect(summary).toContain("critical");
  });
});
