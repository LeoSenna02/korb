export type StoreName =
  | "babies"
  | "feedings"
  | "diapers"
  | "growth"
  | "sleeps"
  | "milestones"
  | "vaccines"
  | "appointments";

export interface SyncQueueEntry {
  queueId: string;
  store: StoreName;
  recordId: string;
  operation: "upsert" | "delete";
  payload: unknown;
  createdAt: string;
  attempts: number;
}

export interface SyncResult {
  success: boolean;
  error?: string;
}
