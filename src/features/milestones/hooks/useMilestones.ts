"use client";

import { useState, useEffect, useCallback } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { getMilestonesByBabyId } from "@/lib/sync/repositories/milestone";
import { subscribeToDataSync } from "@/lib/sync/events";
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

    let cancelled = false;

    async function loadMilestones() {
      if (!baby) return;
      setIsLoading(true);
      try {
        const data = await getMilestonesByBabyId(baby.id);
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
