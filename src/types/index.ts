export type UserRole = "fan" | "volunteer" | "organizer";

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export type CongestionLevel = "low" | "moderate" | "high" | "critical";

export interface GateReading {
  gateId: string;
  label: string;
  currentOccupancy: number;
  capacity: number;
  minutesToKickoff: number;
}

export interface CongestionPrediction {
  gateId: string;
  level: CongestionLevel;
  occupancyRatio: number;
  projectedMinutesToCapacity: number | null;
  recommendation: string;
}

export interface OperationalAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  source: "crowd" | "chat" | "manual";
  message: string;
  createdAt: string;
}
