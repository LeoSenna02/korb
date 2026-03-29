export type ReportPeriod = "day" | "week" | "month" | "all";

export type ActivityType = "mamada" | "fralda" | "sono" | "crescimento";

export interface ReportSummary {
  totalFeedings: number;
  totalSleepMinutes: number;
  totalDiaperChanges: number;
  weightGainGrams: number;
  feedingTrend: number;
  sleepTrend: number;
  diaperTrend: number;
  weightTrend: number;
}

export interface FeedingHourBucket {
  hour: number;
  count: number;
  totalMl: number;
}

export interface SleepPeriodBlock {
  start: string;
  end: string;
  durationMinutes: number;
}

export interface SleepPeriod {
  label: string;
  startHour: number;
  endHour: number;
  totalMinutes: number;
  periods: SleepPeriodBlock[];
}

export interface DiaperBreakdown {
  pee: number;
  poop: number;
  both: number;
}

export interface GrowthDataPoint {
  date: string;
  weightGrams: number;
  heightCm: number;
  cephalicCm: number;
}

export interface TrendComparison {
  metric: string;
  label: string;
  current: number;
  previous: number;
  changePercent: number;
  direction: "up" | "down" | "stable";
  unit: string;
}

export type InsightType = "positive" | "neutral" | "attention";

export interface Insight {
  id: string;
  type: InsightType;
  icon: ActivityType | "pattern";
  title: string;
  description: string;
}

export type MilestoneBadge = "bronze" | "silver" | "gold";

export interface Milestone {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: string;
  badge: MilestoneBadge;
}

export interface HistoryActivity {
  id: string;
  type: ActivityType;
  title: string;
  details: string;
  time: string;
  duration?: string;
  ml?: number;
  isOngoing?: boolean;
}
