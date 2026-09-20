export type Role = "student" | "facilities" | "verifier";
export type Report = {
  id: string;
  title: string;
  description: string;
  location: string;
  edgeId: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Reported" | "In progress" | "Awaiting verification" | "Resolved";
  supports: number;
  createdAt: string;
  updatedAt: string;
  assignee: string | null;
  reporter: string;
  version: number;
  repairNote?: string;
  verificationNote?: string;
  repairedBy?: string;
  workspace?: string;
  supporters?: string[];
};
export type Activity = {
  id: string;
  reportId: string;
  message: string;
  actor: string;
  at: string;
};
export type State = { reports: Report[]; activity: Activity[] };
export type Principal = { id: string; role: Role; workspace: string };
export type Place = { id: string; label: string; x: number; y: number };
export type Edge = {
  id: string;
  from: string;
  to: string;
  meters: number;
  stepFree: boolean;
};
export type Command = {
  type: string;
  id?: string;
  version?: number;
  payload?: Record<string, unknown>;
};
export type RouteResult = {
  nodes: string[];
  edges: string[];
  distance: number;
  blockedCount: number;
};
