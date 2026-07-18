import dynamic from "next/dynamic";
import { BackButton } from "@/components/layout/BackButton";

const HeatmapView = dynamic(
  () => import("@/features/crowd-intelligence/components/HeatmapView").then((m) => m.HeatmapView),
  { loading: () => <p className="text-floodlight-dim">Loading gate predictions…</p> }
);

export const metadata = { title: "Crowd Intelligence — StadiumMind AI" };

export default function CrowdIntelligencePage() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-12">
      <BackButton fallbackHref="/" />
      <h1 className="mt-2 font-display text-3xl font-semibold text-floodlight">Crowd Intelligence</h1>
      <p className="mt-2 max-w-2xl text-floodlight-dim">
        Live occupancy predictions per gate, computed by a deterministic
        congestion model — see <code>predictCongestion.ts</code> for why this
        is not left to the language model.
      </p>
      <div className="mt-8">
        <HeatmapView />
      </div>
    </main>
  );
}
