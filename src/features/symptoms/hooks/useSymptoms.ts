"use client";

import { useCallback, useEffect, useState } from "react";
import { useBaby } from "@/contexts/BabyContext";
import {
  getActiveSymptomEpisodes,
  getResolvedSymptomEpisodes,
} from "@/lib/sync/repositories/symptom";
import { subscribeToDataSync } from "@/lib/sync/events";
import { loadViewCache, readViewCache } from "@/lib/cache/view-cache";
import type { SymptomEpisode } from "@/lib/db/types";
import type { SymptomsSummary } from "../types";

interface CachedSymptomsState {
  activeEpisodes: SymptomEpisode[];
  resolvedEpisodes: SymptomEpisode[];
}

interface UseSymptomsReturn {
  activeEpisodes: SymptomEpisode[];
  resolvedEpisodes: SymptomEpisode[];
  summary: SymptomsSummary;
  isLoading: boolean;
  refresh: () => void;
}

export function useSymptoms(): UseSymptomsReturn {
  const { baby } = useBaby();
  const [activeEpisodes, setActiveEpisodes] = useState<SymptomEpisode[]>([]);
  const [resolvedEpisodes, setResolvedEpisodes] = useState<SymptomEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  useEffect(() => subscribeToDataSync(refresh), [refresh]);

  useEffect(() => {
    if (!baby) {
      setActiveEpisodes([]);
      setResolvedEpisodes([]);
      setIsLoading(false);
      return;
    }

    const babyId = baby.id;
    const cacheKey = `symptoms:${babyId}`;
    const cached = readViewCache<CachedSymptomsState>(cacheKey);
    let cancelled = false;

    if (cached) {
      setActiveEpisodes(cached.activeEpisodes);
      setResolvedEpisodes(cached.resolvedEpisodes);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    async function loadSymptoms() {
      try {
        const result = await loadViewCache(cacheKey, async () => {
          const [activeRecords, resolvedRecords] = await Promise.all([
            getActiveSymptomEpisodes(babyId),
            getResolvedSymptomEpisodes(babyId),
          ]);

          return {
            activeEpisodes: activeRecords,
            resolvedEpisodes: resolvedRecords,
          };
        });

        if (!cancelled) {
          setActiveEpisodes(result.activeEpisodes);
          setResolvedEpisodes(result.resolvedEpisodes);
        }
      } catch (error) {
        console.error("[useSymptoms] Failed to load symptoms:", error);
        if (!cancelled) {
          setActiveEpisodes([]);
          setResolvedEpisodes([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSymptoms();

    return () => {
      cancelled = true;
    };
  }, [baby, refreshKey]);

  return {
    activeEpisodes,
    resolvedEpisodes,
    summary: {
      activeCount: activeEpisodes.length,
      resolvedCount: resolvedEpisodes.length,
      totalCount: activeEpisodes.length + resolvedEpisodes.length,
    },
    isLoading,
    refresh,
  };
}
