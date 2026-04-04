"use client";

import { useState, useEffect, useCallback } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { parseDateLocal } from "@/lib/utils/format";
import { getRecordCounts } from "@/lib/db/repositories/stats";
import type { RecordCounts } from "@/lib/db/repositories/stats";
import type { BabyProfile } from "../types";
import type { Baby } from "@/lib/db/types";
import type { DataStats } from "../types";

function babyToProfile(baby: Baby): BabyProfile {
  return {
    id: baby.id,
    name: baby.name,
    birthDate: baby.birthDate,
    gestationalWeeks: 40,
    dueDate: "",
    gender: baby.gender === "boy" ? "male" : "female",
    photoUrl: baby.photoUrl ?? "",
    bloodType: baby.bloodType ?? "",
  };
}

function calcTotalDays(birthDate: string): number {
  const birth = parseDateLocal(birthDate);
  const now = new Date();
  return Math.max(1, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)));
}

export interface UseProfileDataReturn {
  babyProfile: BabyProfile | null;
  user: { name: string; email: string } | null;
  counts: RecordCounts;
  dataStats: DataStats;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useProfileData(): UseProfileDataReturn {
  const { baby } = useBaby();
  const { user: authUser } = useAuthContext();
  const [counts, setCounts] = useState<RecordCounts>({
    totalFeedings: 0,
    totalSleeps: 0,
    totalDiapers: 0,
    totalGrowth: 0,
    totalVaccines: 0,
    totalAppointments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!baby) {
      setCounts({
        totalFeedings: 0,
        totalSleeps: 0,
        totalDiapers: 0,
        totalGrowth: 0,
        totalVaccines: 0,
        totalAppointments: 0,
      });
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadStats() {
      if (!baby) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await getRecordCounts(baby.id);
        if (!cancelled) {
          setCounts(result);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[useProfileData] Failed to load stats:", err);
          setError("Erro ao carregar estatísticas");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [baby, refreshKey]);

  const babyProfile = baby ? babyToProfile(baby) : null;

  const userData = authUser
    ? { name: authUser.name, email: authUser.email }
    : null;

  const totalDays = baby ? calcTotalDays(baby.birthDate) : 0;

  return {
    babyProfile,
    user: userData,
    counts,
    dataStats: {
      ...counts,
      totalDays,
    },
    isLoading,
    error,
    refresh,
  };
}
