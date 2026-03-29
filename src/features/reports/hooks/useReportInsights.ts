"use client";

import { useMemo } from "react";
import type { FeedingRecord, SleepRecord, DiaperRecord, GrowthRecord } from "@/lib/db/types";
import type { ReportPeriod } from "../types";

interface UseReportInsightsReturn {
  avgFeedingInterval: string;
  avgSleepNight: string;
  feedingPeakHour: string;
  sleepQualityScore: number;
  diaperAvgPerDay: number;
  projectedWeeklyWeightGain: number;
}

const PERIOD_DAYS: Record<ReportPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  all: 90,
};

export function useReportInsights(params: {
  feedings: FeedingRecord[];
  sleeps: SleepRecord[];
  diapers: DiaperRecord[];
  growthRecords: GrowthRecord[];
  period: ReportPeriod;
}): UseReportInsightsReturn {
  const { feedings, sleeps, diapers, growthRecords, period } = params;

  return useMemo(() => {
    const periodDays = PERIOD_DAYS[period];

    const avgFeedingInterval = calcAvgFeedingInterval(feedings);
    const avgSleepNight = calcAvgSleepNight(sleeps);
    const feedingPeakHour = calcFeedingPeakHour(feedings);
    const sleepQualityScore = calcSleepQuality(sleeps);
    const diaperAvgPerDay = periodDays > 0
      ? Math.round((diapers.length / periodDays) * 10) / 10
      : 0;
    const projectedWeeklyWeightGain = calcProjectedWeeklyGain(growthRecords);

    return {
      avgFeedingInterval,
      avgSleepNight,
      feedingPeakHour,
      sleepQualityScore,
      diaperAvgPerDay,
      projectedWeeklyWeightGain,
    };
  }, [feedings, sleeps, diapers, growthRecords, period]);
}

function formatHourMinute(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function calcAvgFeedingInterval(feedings: FeedingRecord[]): string {
  if (feedings.length < 2) return "--";
  const sorted = [...feedings].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff = new Date(sorted[i].startedAt).getTime() - new Date(sorted[i - 1].startedAt).getTime();
    intervals.push(diff / 60000);
  }
  const avgMin = intervals.reduce((s, v) => s + v, 0) / intervals.length;
  return formatHourMinute(avgMin);
}

function calcAvgSleepNight(sleeps: SleepRecord[]): string {
  const nightSleeps = sleeps.filter(
    (s) => s.type === "night" && s.endedAt != null
  );
  if (nightSleeps.length === 0) return "--";
  const totalMin = nightSleeps.reduce((total, s) => {
    const start = new Date(s.startedAt).getTime();
    const end = new Date(s.endedAt!).getTime();
    return total + (end - start) / 60000;
  }, 0);
  return formatHourMinute(totalMin / nightSleeps.length);
}

function calcFeedingPeakHour(feedings: FeedingRecord[]): string {
  if (feedings.length === 0) return "--";
  const hourCounts = new Map<number, number>();
  for (const f of feedings) {
    const h = new Date(f.startedAt).getHours();
    hourCounts.set(h, (hourCounts.get(h) ?? 0) + 1);
  }
  let peakHour = 0;
  let peakCount = 0;
  for (const [h, c] of hourCounts) {
    if (c > peakCount) {
      peakCount = c;
      peakHour = h;
    }
  }
  return `${String(peakHour).padStart(2, "0")}:00`;
}

function calcSleepQuality(sleeps: SleepRecord[]): number {
  const completed = sleeps.filter((s) => s.endedAt != null);
  if (completed.length === 0) return 0;

  const durations = completed.map((s) => {
    const diff = new Date(s.endedAt!).getTime() - new Date(s.startedAt).getTime();
    return diff / 3600000;
  });

  const avg = durations.reduce((s, d) => s + d, 0) / durations.length;
  const variance = durations.reduce((s, d) => s + Math.pow(d - avg, 2), 0) / durations.length;
  const stdDev = Math.sqrt(variance);

  const avgScore = Math.min(avg / 3, 1) * 50;
  const consistencyScore = Math.max(0, 1 - stdDev / 2) * 50;

  return Math.round(avgScore + consistencyScore);
}

function calcProjectedWeeklyGain(growthRecords: GrowthRecord[]): number {
  if (growthRecords.length < 2) return 0;
  const sorted = [...growthRecords].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (first.weightKg == null || last.weightKg == null) return 0;

  const gainGrams = (last.weightKg - first.weightKg) * 1000;
  const daysDiff = (new Date(last.measuredAt).getTime() - new Date(first.measuredAt).getTime()) / 86400000;
  if (daysDiff <= 0) return 0;

  return Math.round((gainGrams / daysDiff) * 7);
}
