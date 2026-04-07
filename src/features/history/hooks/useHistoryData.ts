"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { getAllActivitiesForHistory, getWeeklyStats } from "@/lib/sync/repositories";
import { subscribeToDataSync } from "@/lib/sync/events";
import type { HistoryActivity, HistoryGroup, HistoryFilter, WeeklyStat } from "../types";

function groupActivitiesByDate(activities: HistoryActivity[]): HistoryGroup[] {
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayYear = yesterdayDate.getFullYear();
  const yesterdayMonth = yesterdayDate.getMonth();
  const yesterdayDay = yesterdayDate.getDate();

  const weekAgoDate = new Date(now);
  weekAgoDate.setDate(weekAgoDate.getDate() - 7);
  const weekAgoYear = weekAgoDate.getFullYear();
  const weekAgoMonth = weekAgoDate.getMonth();
  const weekAgoDay = weekAgoDate.getDate();

  const monthAgoDate = new Date(now);
  monthAgoDate.setDate(monthAgoDate.getDate() - 30);
  const monthAgoYear = monthAgoDate.getFullYear();
  const monthAgoMonth = monthAgoDate.getMonth();
  const monthAgoDay = monthAgoDate.getDate();

  const groups: Record<string, HistoryActivity[]> = {
    Hoje: [],
    Ontem: [],
    "Esta Semana": [],
    "Este Mês": [],
    "Mais Antigos": [],
  };

  for (const activity of activities) {
    const activityDate = new Date(activity.sortKey);
    const aYear = activityDate.getFullYear();
    const aMonth = activityDate.getMonth();
    const aDay = activityDate.getDate();

    // Check if activity is today (local date matches today)
    if (aYear === todayYear && aMonth === todayMonth && aDay === todayDate) {
      groups["Hoje"].push(activity);
    } else if (aYear === yesterdayYear && aMonth === yesterdayMonth && aDay === yesterdayDay) {
      groups["Ontem"].push(activity);
    } else if (
      aYear > weekAgoYear ||
      (aYear === weekAgoYear && aMonth > weekAgoMonth) ||
      (aYear === weekAgoYear && aMonth === weekAgoMonth && aDay >= weekAgoDay)
    ) {
      groups["Esta Semana"].push(activity);
    } else if (
      aYear > monthAgoYear ||
      (aYear === monthAgoYear && aMonth > monthAgoMonth) ||
      (aYear === monthAgoYear && aMonth === monthAgoMonth && aDay >= monthAgoDay)
    ) {
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

  useEffect(() => subscribeToDataSync(refresh), [refresh]);

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
