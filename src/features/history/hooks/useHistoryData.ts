"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { getAllActivitiesForHistory, getWeeklyStats } from "@/lib/db/repositories/history";
import type { HistoryActivity, HistoryGroup, HistoryFilter, WeeklyStat } from "../types";

function groupActivitiesByDate(activities: HistoryActivity[]): HistoryGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  yesterday.setHours(23, 59, 59, 999);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  weekAgo.setHours(23, 59, 59, 999);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  monthAgo.setHours(23, 59, 59, 999);

  const groups: Record<string, HistoryActivity[]> = {
    Hoje: [],
    Ontem: [],
    "Esta Semana": [],
    "Este Mês": [],
    "Mais Antigos": [],
  };

  for (const activity of activities) {
    const activityDate = new Date(activity.sortKey);
    activityDate.setHours(23, 59, 59, 999);

    if (activityDate >= today) {
      groups["Hoje"].push(activity);
    } else if (activityDate >= yesterday) {
      groups["Ontem"].push(activity);
    } else if (activityDate >= weekAgo) {
      groups["Esta Semana"].push(activity);
    } else if (activityDate >= monthAgo) {
      groups["Este Mês"].push(activity);
    } else {
      groups["Mais Antigos"].push(activity);
    }
  }

  return Object.entries(groups)
    .filter(([, activities]) => activities.length > 0)
    .map(([label, activities]) => ({ label, activities }));
}

interface UseHistoryDataReturn {
  activities: HistoryActivity[];
  filteredGroups: HistoryGroup[];
  weeklyStats: WeeklyStat[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useHistoryData(): UseHistoryDataReturn {
  const { baby } = useBaby();
  const [activities, setActivities] = useState<HistoryActivity[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!baby) {
      setActivities([]);
      setWeeklyStats([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      if (!baby) return;

      setIsLoading(true);
      setError(null);

      try {
        const [allActivities, stats] = await Promise.all([
          getAllActivitiesForHistory(baby.id),
          getWeeklyStats(baby.id),
        ]);

        if (!cancelled) {
          setActivities(allActivities);
          setWeeklyStats(stats);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[useHistoryData] Failed to load:", err);
          setError("Erro ao carregar dados");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [baby, refreshKey]);

  const filteredGroups = useMemo(() => {
    if (activities.length === 0) return [];
    return groupActivitiesByDate(activities);
  }, [activities]);

  return {
    activities,
    filteredGroups,
    weeklyStats,
    isLoading,
    error,
    refresh,
  };
}

export function useFilteredHistory(
  groups: HistoryGroup[],
  filter: HistoryFilter
): HistoryGroup[] {
  return useMemo(() => {
    if (filter === "tudo") return groups;

    return groups
      .map((group) => ({
        ...group,
        activities: group.activities.filter((a) => a.type === filter),
      }))
      .filter((group) => group.activities.length > 0);
  }, [groups, filter]);
}
