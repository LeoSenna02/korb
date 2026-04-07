"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { getReportFeedings, getReportSleeps, getReportDiapers, getReportGrowth } from "@/lib/sync/repositories";
import { subscribeToDataSync } from "@/lib/sync/events";
import {
  buildReportSummary,
  buildFeedingByHour,
  buildSleepPeriods,
  buildDiaperBreakdown,
  buildGrowthSeries,
  buildTrendComparisons,
  buildMilestones,
  buildInsights,
} from "@/lib/sync/repositories";
import type {
  ReportPeriod,
  ReportSummary,
  FeedingHourBucket,
  SleepPeriod,
  DiaperBreakdown,
  GrowthDataPoint,
  TrendComparison,
  Insight,
  Milestone,
} from "../types";
import type { FeedingRecord, SleepRecord, DiaperRecord, GrowthRecord } from "@/lib/db/types";

interface UseReportsDataReturn {
  period: ReportPeriod;
  setPeriod: (p: ReportPeriod) => void;
  summaries: ReportSummary;
  summariesPrev: ReportSummary;
  feedingByHour: FeedingHourBucket[];
  sleepPeriods: SleepPeriod[];
  diaperBreakdown: DiaperBreakdown;
  growthSeries: GrowthDataPoint[];
  trends: TrendComparison[];
  insights: Insight[];
  milestones: Milestone[];
  rawFeedings: FeedingRecord[];
  rawSleeps: SleepRecord[];
  rawDiapers: DiaperRecord[];
  rawGrowth: GrowthRecord[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
}

const EMPTY_SUMMARY: ReportSummary = {
  totalFeedings: 0,
  totalSleepMinutes: 0,
  totalDiaperChanges: 0,
  weightGainGrams: 0,
  feedingTrend: 0,
  sleepTrend: 0,
  diaperTrend: 0,
  weightTrend: 0,
};

function getPeriodDates(period: ReportPeriod): {
  start: Date;
  prevStart: Date;
  end: Date;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  let start: Date;
  let prevStart: Date;

  switch (period) {
    case "day":
      start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      prevStart = new Date(Date.UTC(year, month, day - 1, 0, 0, 0, 0));
      break;
    case "week":
      start = new Date(Date.UTC(year, month, day - 7, 0, 0, 0, 0));
      prevStart = new Date(Date.UTC(year, month, day - 14, 0, 0, 0, 0));
      break;
    case "month":
      start = new Date(Date.UTC(year, month, day - 30, 0, 0, 0, 0));
      prevStart = new Date(Date.UTC(year, month, day - 60, 0, 0, 0, 0));
      break;
    case "all":
      start = new Date(0);
      prevStart = new Date(0);
      break;
  }

  return { start, prevStart, end };
}

export function useReportsData(
  period: ReportPeriod,
  setPeriod: (p: ReportPeriod) => void
): UseReportsDataReturn {
  const { baby } = useBaby();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasResolvedOnce, setHasResolvedOnce] = useState(false);

  const [summaries, setSummaries] = useState<ReportSummary>(EMPTY_SUMMARY);
  const [summariesPrev, setSummariesPrev] = useState<ReportSummary>(EMPTY_SUMMARY);
  const [feedingByHour, setFeedingByHour] = useState<FeedingHourBucket[]>(
    () => Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0, totalMl: 0 }))
  );
  const [sleepPeriods, setSleepPeriods] = useState<SleepPeriod[]>([]);
  const [diaperBreakdown, setDiaperBreakdown] = useState<DiaperBreakdown>({ pee: 0, poop: 0, both: 0 });
  const [growthSeries, setGrowthSeries] = useState<GrowthDataPoint[]>([]);
  const [trends, setTrends] = useState<TrendComparison[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const [rawFeedings, setRawFeedings] = useState<FeedingRecord[]>([]);
  const [rawSleeps, setRawSleeps] = useState<SleepRecord[]>([]);
  const [rawDiapers, setRawDiapers] = useState<DiaperRecord[]>([]);
  const [rawGrowth, setRawGrowth] = useState<GrowthRecord[]>([]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => subscribeToDataSync(refresh), [refresh]);

  useEffect(() => {
    if (!baby) {
      setIsLoading(false);
      setIsRefreshing(false);
      setHasResolvedOnce(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      if (!baby) return;

      if (hasResolvedOnce) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      if (!hasResolvedOnce) {
        setError(null);
      }

      try {
        const { start, prevStart, end } = getPeriodDates(period);

        const [feedings, sleeps, diapers, allGrowth, prevFeedings, prevSleeps, prevDiapers] =
          await Promise.all([
            getReportFeedings(baby.id, start, end),
            getReportSleeps(baby.id, start, end),
            getReportDiapers(baby.id, start, end),
            getReportGrowth(baby.id),
            getReportFeedings(baby.id, prevStart, start),
            getReportSleeps(baby.id, prevStart, start),
            getReportDiapers(baby.id, prevStart, start),
          ]);

        if (cancelled) return;

        const growthInPeriod = allGrowth.filter(
          (g) => new Date(g.measuredAt).getTime() >= start.getTime()
        );
        const prevGrowth = allGrowth.filter(
          (g) => new Date(g.measuredAt).getTime() >= prevStart.getTime() &&
                 new Date(g.measuredAt).getTime() < start.getTime()
        );

        const summary = buildReportSummary(
          feedings, sleeps, diapers, growthInPeriod,
          prevFeedings, prevSleeps, prevDiapers, prevGrowth
        );
        const summaryPrev = buildReportSummary(
          prevFeedings, prevSleeps, prevDiapers, prevGrowth,
          [], [], [], []
        );

        setSummaries(summary);
        setSummariesPrev(summaryPrev);
        setFeedingByHour(buildFeedingByHour(feedings));
        setSleepPeriods(buildSleepPeriods(sleeps));
        setDiaperBreakdown(buildDiaperBreakdown(diapers));
        setGrowthSeries(buildGrowthSeries(allGrowth));
        setTrends(buildTrendComparisons(summary, summaryPrev));
        setMilestones(buildMilestones(allGrowth, sleeps, feedings));
        setRawFeedings(feedings);
        setRawSleeps(sleeps);
        setRawDiapers(diapers);
        setRawGrowth(allGrowth);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          console.error("[useReportsData] Failed to load:", err);
          if (!hasResolvedOnce) {
            setError("Erro ao carregar dados");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
          setHasResolvedOnce(true);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [baby, hasResolvedOnce, period, refreshKey]);

  const insights = useMemo(
    () => buildInsights(rawFeedings, rawSleeps, rawDiapers, rawGrowth, period),
    [rawFeedings, rawSleeps, rawDiapers, rawGrowth, period]
  );

  return {
    period,
    setPeriod,
    summaries,
    summariesPrev,
    feedingByHour,
    sleepPeriods,
    diaperBreakdown,
    growthSeries,
    trends,
    insights,
    milestones,
    rawFeedings,
    rawSleeps,
    rawDiapers,
    rawGrowth,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
