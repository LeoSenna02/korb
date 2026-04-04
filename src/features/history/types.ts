export type ActivityType =
  | "mamada"
  | "fralda"
  | "sono"
  | "crescimento"
  | "consulta";

export interface HistoryActivity {
  id: string;
  type: ActivityType;
  title: string;
  details: string;
  /** Format: dd/MM/yyyy for grouping */
  date: string;
  /** Format: HH:mm for display */
  time: string;
  /** ISO string for sorting (not formatted) */
  sortKey: string;
  duration?: string;
  isOngoing?: boolean;
}

export interface HistoryGroup {
  label: string;
  activities: HistoryActivity[];
}

export type HistoryFilter =
  | "tudo"
  | "mamada"
  | "fralda"
  | "sono"
  | "crescimento"
  | "consulta";

export interface WeeklyStat {
  id: string;
  icon: "feeding" | "sleep" | "diaper" | "growth";
  value: string;
  label: string;
}
