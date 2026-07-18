import Link from "next/link";
import { MessageCircle, Map, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "StadiumMind AI — FIFA World Cup 2026 Operations Platform",
  description:
    "AI-powered stadium operations: fan assistance, crowd intelligence, and real-time decision support for FIFA World Cup 2026.",
};

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Fan Assistant",
    description:
      "Streaming AI chat in any language. Directions, queues, food, match info — answered instantly.",
  },
  {
    icon: Map,
    title: "Crowd Intelligence",
    description:
      "Deterministic gate-occupancy model with AI narration, open to every fan. Predict congestion before it becomes dangerous.",
  },
  {
    icon: ShieldAlert,
    title: "Operations Dashboard",
    description:
      "Aggregated alerts for staff. Crowd data + fan signals turned into prioritised, actionable briefings.",
  },
];

export default function HomePage() {
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-6 py-20">
      {/* Hero */}
      <section className="text-center">
        <span className="inline-block rounded-full border border-turf px-4 py-1 text-sm font-medium text-turf mb-6">
          FIFA World Cup 2026 · AI Operations Platform
        </span>
        <h1 className="font-display text-5xl font-bold text-floodlight leading-tight mb-6">
          See the crowd before it
          <br />
          <span className="text-turf">becomes a crisis</span>
        </h1>
        <p className="max-w-2xl mx-auto text-floodlight-dim text-lg mb-10">
          StadiumMind AI gives fans multilingual help and live crowd
          intelligence, and gives operations teams prioritised alerts — all
          powered by Gemini AI.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/fan-assistant"
            className="rounded-lg bg-turf px-6 py-3 font-semibold text-pitch hover:bg-turf-bright transition-colors"
          >
            Try the Fan Assistant
          </Link>
          <Link
            href="/crowd-intelligence"
            className="rounded-lg border border-pitch-line px-6 py-3 font-semibold text-floodlight hover:border-turf transition-colors"
          >
            View Crowd Intelligence
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-pitch-line px-6 py-3 font-semibold text-floodlight hover:border-turf transition-colors"
          >
            Ops Dashboard (Staff)
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mt-24 grid gap-6 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-card border border-pitch-line bg-pitch-surface p-6 transition-colors hover:border-turf/50"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-turf/10">
              <Icon className="h-5 w-5 text-turf" aria-hidden="true" />
            </div>
            <h2 className="font-display text-lg font-semibold text-floodlight mb-2">{title}</h2>
            <p className="text-floodlight-dim text-sm">{description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
