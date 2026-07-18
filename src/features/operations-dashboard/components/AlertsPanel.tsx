import type { OperationalAlert } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const severityColor: Record<OperationalAlert["severity"], string> = {
  info: "border-l-alert-info",
  warning: "border-l-alert-amber",
  critical: "border-l-alert-red",
};

const severityBadgeColor: Record<OperationalAlert["severity"], string> = {
  info: "bg-alert-info/20 text-alert-info",
  warning: "bg-alert-amber/20 text-alert-amber",
  critical: "bg-alert-red/20 text-alert-red",
};

// In production this comes from a live aggregation job (see docs/ARCHITECTURE.md
// § Operations Dashboard) that merges crowd predictions, chat escalations, and
// manual staff reports. Mocked here so the dashboard is inspectable without a DB.
const MOCK_ALERTS: OperationalAlert[] = [
  {
    id: "1",
    severity: "critical",
    source: "crowd",
    message: "Gate C at 91% capacity, projected to reach capacity before kickoff. Overflow lane recommended.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    severity: "warning",
    source: "chat",
    message: "12 Fan Assistant sessions in the last 10 minutes asked about Gate C wait times — matches crowd signal.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    severity: "info",
    source: "manual",
    message: "Volunteer team briefed on multilingual support rotation for the 19:00 kickoff.",
    createdAt: new Date().toISOString(),
  },
];

export function AlertsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Live Alerts
          <span className="rounded-full bg-turf/20 px-2 py-0.5 font-mono text-xs text-turf">Demo feed</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3" aria-label="Operational alerts, most severe first">
          {MOCK_ALERTS.map((alert) => (
            <li
              key={alert.id}
              className={`rounded-md border-l-4 bg-pitch px-3 py-2 ${severityColor[alert.severity]}`}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-floodlight-dim">
                <span
                  className={`rounded-full px-2 py-0.5 font-mono uppercase ${severityBadgeColor[alert.severity]}`}
                >
                  {alert.severity}
                </span>
                <span className="font-mono uppercase">{alert.source}</span>
              </div>
              <p className="mt-1 text-sm text-floodlight">{alert.message}</p>
              <p className="mt-2 font-mono text-[11px] text-floodlight-dim/80">
                {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
