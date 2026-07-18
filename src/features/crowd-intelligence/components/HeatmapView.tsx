"use client";

import { useCallback, useEffect, useState } from "react";
import type { CongestionPrediction, GateReading } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWithTimeout, FetchTimeoutError } from "@/lib/utils/fetchWithTimeout";
import { AlertTriangle, RotateCcw } from "lucide-react";

const MOCK_GATES: GateReading[] = [
  { gateId: "A", label: "Gate A — North", currentOccupancy: 4200, capacity: 10000, minutesToKickoff: 45 },
  { gateId: "B", label: "Gate B — East", currentOccupancy: 6800, capacity: 10000, minutesToKickoff: 45 },
  { gateId: "C", label: "Gate C — South", currentOccupancy: 9100, capacity: 10000, minutesToKickoff: 45 },
  { gateId: "D", label: "Gate D — West", currentOccupancy: 3500, capacity: 10000, minutesToKickoff: 45 },
];

const GATE_BY_ID = new Map(MOCK_GATES.map((g) => [g.gateId, g]));

const levelColor: Record<string, string> = {
  low: "bg-turf",
  moderate: "bg-turf-bright",
  high: "bg-alert-amber",
  critical: "bg-alert-red",
};

function HeatmapSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Loading gate predictions">
      {MOCK_GATES.map((g) => (
        <div key={g.gateId} className="rounded-card border border-pitch-line bg-pitch-surface/80 p-5 space-y-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function HeatmapView() {
  const [predictions, setPredictions] = useState<CongestionPrediction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const load = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithTimeout(
        "/api/crowd/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(MOCK_GATES.map(({ label, ...rest }) => rest)),
          signal,
        },
        10_000
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not load live crowd data. The server returned an error.");
      }
      const data = await res.json();
      if (!signal.aborted) setPredictions(data.predictions);
    } catch (err) {
      if (signal.aborted) return;
      if (err instanceof FetchTimeoutError) {
        setError("The request took too long to respond. Check your connection and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Could not load live crowd data.");
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load, retryCount]);

  if (loading) return <HeatmapSkeleton />;

  if (error || !predictions) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-card border border-alert-red/30 bg-alert-red/5 px-6 py-8 text-center"
      >
        <AlertTriangle className="h-6 w-6 text-alert-red" aria-hidden="true" />
        <p className="text-floodlight-dim">{error ?? "No prediction data available."}</p>
        <Button size="sm" variant="secondary" onClick={() => setRetryCount((c) => c + 1)}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <p className="rounded-card border border-pitch-line bg-pitch-surface/60 px-6 py-8 text-center text-floodlight-dim">
        No gate data is available right now. Check back closer to kickoff.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {predictions.map((p) => {
        const gate = GATE_BY_ID.get(p.gateId);
        return (
          <Card key={p.gateId} className="transition-shadow hover:shadow-xl hover:shadow-black/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {gate?.label ?? `Gate ${p.gateId}`}
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-xs text-pitch ${levelColor[p.level]}`}
                >
                  {p.level.toUpperCase()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-pitch">
                <div
                  className={`h-full transition-[width] duration-500 ease-out ${levelColor[p.level]}`}
                  style={{ width: `${Math.min(100, p.occupancyRatio * 100)}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(p.occupancyRatio * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${gate?.label ?? `Gate ${p.gateId}`} occupancy`}
                />
              </div>
              <p className="font-mono text-sm text-floodlight-dim">
                {Math.round(p.occupancyRatio * 100)}% full
                {p.projectedMinutesToCapacity !== null &&
                  ` · full in ~${p.projectedMinutesToCapacity} min`}
              </p>
              <p className="text-sm text-floodlight">{p.recommendation}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
