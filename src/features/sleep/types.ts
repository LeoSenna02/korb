import type { SleepType } from "@/lib/db/types";

export type SleepGoalSource = "age" | "adaptive";

export interface SleepGoalRange {
  minSeconds: number;
  maxSeconds: number;
  progressPercent: number;
  source: SleepGoalSource;
  totalSecondsToday: number;
}

export interface ActiveSleepSession {
  babyId: string;
  type: SleepType;
  startedAt: string;
  isPaused: boolean;
  pausedTotalMs: number;
  pauseStartedAt?: string;
  startedBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type SleepSessionActionErrorCode =
  | "INVALID_INPUT"
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "NO_ACTIVE_SESSION"
  | "UNKNOWN_ERROR";

export interface SleepSessionActionResult {
  success: boolean;
  session: ActiveSleepSession | null;
  errorCode?: SleepSessionActionErrorCode;
  message?: string;
}
