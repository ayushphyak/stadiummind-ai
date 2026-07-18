import dynamic from "next/dynamic";
import { AlertsPanel } from "@/features/operations-dashboard/components/AlertsPanel";
import { BackButton } from "@/components/layout/BackButton";

const HeatmapView = dynamic(
  () => import("@/features/crowd-intelligence/components/HeatmapView").then((m) => m.HeatmapView),
  { loading: () => <p className="text-floodlight-dim">Loading gate predictions…</p> }
);

export const metadata = { title: "Operations Dashboard — StadiumMind AI" };

// Access to this route is gated in src/middleware.ts (organizer/volunteer
// role required) — no client-side-only auth check here, since that would
// be trivially bypassable.
export default function DashboardPage() {
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-6 py-12">
      <BackButton fallbackHref="/" />
      <h1 className="mt-2 font-display text-3xl font-semibold text-floodlight">Operations Dashboard</h1>
      <p className="mt-2 max-w-2xl text-floodlight-dim">
        Staff-only view combining crowd predictions, fan-assistant signal, and
        manual reports into a single prioritized alert feed.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HeatmapView />
        </div>
        <div>
          <AlertsPanel />
        </div>
      </div>
    </main>
  );
}
