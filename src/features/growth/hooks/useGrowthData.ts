"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { getGrowthByBabyId } from "@/lib/db/repositories/growth";
import type { GrowthRecord } from "@/lib/db/types";
import type {
  GrowthSummary,
  GrowthChartDataPoint,
  GrowthRecordDisplay,
} from "../types";
import { buildGrowthMetricReferenceState } from "../utils/growth-reference";

export function useGrowthData() {
  const { baby } = useBaby();
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!baby) {
      setRecords([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      if (!baby) return;
      setIsLoading(true);
      try {
        const result = await getGrowthByBabyId(baby.id);
        if (!cancelled) {
          setRecords(result);
        }
      } catch (err) {
        console.error("[useGrowthData] Load error:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [baby, refreshKey]);

  const chronological = useMemo(
    () => [...records].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)),
    [records],
  );

  const summary = useMemo<GrowthSummary>(() => {
    if (chronological.length === 0) {
      return {
        currentWeightKg: null,
        currentHeightCm: null,
        currentCephalicCm: null,
        weightGainKg: null,
        heightGainCm: null,
        cephalicGainCm: null,
        firstMeasureDate: null,
        lastMeasureDate: null,
        totalRecords: 0,
      };
    }

    const first = chronological[0];
    const last = chronological[chronological.length - 1];

    return {
      currentWeightKg: last.weightKg ?? null,
      currentHeightCm: last.heightCm ?? null,
      currentCephalicCm: last.cephalicCm ?? null,
      weightGainKg:
        first.weightKg != null && last.weightKg != null
          ? last.weightKg - first.weightKg
          : null,
      heightGainCm:
        first.heightCm != null && last.heightCm != null
          ? last.heightCm - first.heightCm
          : null,
      cephalicGainCm:
        first.cephalicCm != null && last.cephalicCm != null
          ? last.cephalicCm - first.cephalicCm
          : null,
      firstMeasureDate: first.measuredAt,
      lastMeasureDate: last.measuredAt,
      totalRecords: chronological.length,
    };
  }, [chronological]);

  const weightSeries = useMemo<GrowthChartDataPoint[]>(
    () =>
      chronological
        .filter((r) => r.weightKg != null)
        .map((r) => ({ date: r.measuredAt, value: r.weightKg! })),
    [chronological],
  );

  const heightSeries = useMemo<GrowthChartDataPoint[]>(
    () =>
      chronological
        .filter((r) => r.heightCm != null)
        .map((r) => ({ date: r.measuredAt, value: r.heightCm! })),
    [chronological],
  );

  const cephalicSeries = useMemo<GrowthChartDataPoint[]>(
    () =>
      chronological
        .filter((r) => r.cephalicCm != null)
        .map((r) => ({ date: r.measuredAt, value: r.cephalicCm! })),
    [chronological],
  );

  const weightReference = useMemo(
    () =>
      buildGrowthMetricReferenceState({
        baby,
        metric: "weight",
        series: weightSeries,
      }),
    [baby, weightSeries],
  );

  const heightReference = useMemo(
    () =>
      buildGrowthMetricReferenceState({
        baby,
        metric: "height",
        series: heightSeries,
      }),
    [baby, heightSeries],
  );

  const cephalicReference = useMemo(
    () =>
      buildGrowthMetricReferenceState({
        baby,
        metric: "cephalic",
        series: cephalicSeries,
      }),
    [baby, cephalicSeries],
  );

  const displayRecords = useMemo<GrowthRecordDisplay[]>(
    () =>
      [...records]
        .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))
        .map((r) => ({
          id: r.id,
          date: r.measuredAt,
          weightKg: r.weightKg,
          heightCm: r.heightCm,
          cephalicCm: r.cephalicCm,
          notes: r.notes,
        })),
    [records],
  );

  return useMemo(
    () => ({
      summary,
      weightSeries,
      heightSeries,
      cephalicSeries,
      weightReference,
      heightReference,
      cephalicReference,
      displayRecords,
      isLoading,
      totalRecords: records.length,
      refresh,
    }),
    [
      cephalicReference,
      cephalicSeries,
      displayRecords,
      heightReference,
      heightSeries,
      isLoading,
      records.length,
      refresh,
      summary,
      weightReference,
      weightSeries,
    ],
  );
}
