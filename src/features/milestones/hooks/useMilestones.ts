"use client";

import { useState, useEffect, useCallback } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { getMilestonesByBabyId } from "@/lib/sync/repositories/milestone";
import { subscribeToDataSync } from "@/lib/sync/events";
import { loadViewCache, readViewCache } from "@/lib/cache/view-cache";
import type { MilestoneRecord } from "../types";

interface UseMilestonesReturn {
  records: MilestoneRecord[];
  isLoading: boolean;
  refresh: () => void;
}

export function useMilestones(): UseMilestonesReturn {
  const { baby } = useBaby();
  const [records, setRecords] = useState<MilestoneRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => subscribeToDataSync(refresh), [refresh]);

  useEffect(() => {
    if (!baby) {
      setRecords([]);
      setIsLoading(false);
      return;
    }

    const cacheKey = `milestones:${baby.id}`;
    const cached = readViewCache<MilestoneRecord[]>(cacheKey);
    let cancelled = false;

    if (cached) {
      setRecords(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    async function loadMilestones() {
      if (!baby) return;
      try {
        const data = await loadViewCache(cacheKey, () =>
          getMilestonesByBabyId(baby.id)
        );
        if (!cancelled) {
          setRecords(data);
        }
      } catch (err) {
        console.error("[useMilestones] Failed to load:", err);
        if (!cancelled) {
          setRecords([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadMilestones();

    return () => {
      cancelled = true;
    };
  }, [baby, refreshKey]);

  return {
    records,
    isLoading,
    refresh,
  };
}
