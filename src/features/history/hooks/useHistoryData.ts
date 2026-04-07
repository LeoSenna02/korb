"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { getHistoryPage, getWeeklyStats } from "@/lib/sync/repositories";
import { subscribeToDataSync } from "@/lib/sync/events";
import type { HistoryActivity, HistoryGroup, HistoryFilter, WeeklyStat } from "../types";

const HISTORY_PAGE_SIZE = 40;

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
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  refresh: () => void;
  loadMore: () => void;
}

export function useHistoryData(): UseHistoryDataReturn {
  const { baby } = useBaby();
  const [activities, setActivities] = useState<HistoryActivity[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1);
  const [hasResolvedOnce, setHasResolvedOnce] = useState(false);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const loadMore = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  useEffect(() => subscribeToDataSync(refresh), [refresh]);

  useEffect(() => {
    if (!baby) {
      setActivities([]);
      setWeeklyStats([]);
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
      setHasMore(false);
      setHasResolvedOnce(false);
      setPage(1);
      return;
    }

    let cancelled = false;

    async function loadData() {
      if (!baby) return;

      if (!hasResolvedOnce) {
        setIsLoading(true);
        setError(null);
      } else if (page > 1) {
        setIsLoadingMore(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const [pageResult, stats] = await Promise.all([
          getHistoryPage(baby.id, HISTORY_PAGE_SIZE * page, 0),
          getWeeklyStats(baby.id),
        ]);

        if (!cancelled) {
          setActivities(pageResult.activities);
          setWeeklyStats(stats);
          setHasMore(pageResult.hasMore);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[useHistoryData] Failed to load:", err);
          if (!hasResolvedOnce) {
            setError("Erro ao carregar dados");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
          setIsLoadingMore(false);
          setHasResolvedOnce(true);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [baby, hasResolvedOnce, page, refreshKey]);

  const filteredGroups = useMemo(() => {
    if (activities.length === 0) return [];
    return groupActivitiesByDate(activities);
  }, [activities]);

  return {
    activities,
    filteredGroups,
    weeklyStats,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
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
