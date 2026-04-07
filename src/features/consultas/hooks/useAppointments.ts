"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { getAppointmentsByBabyId } from "@/lib/sync/repositories/appointment";
import { subscribeToDataSync } from "@/lib/sync/events";
import { loadViewCache, readViewCache } from "@/lib/cache/view-cache";
import type { PediatricAppointment } from "@/lib/db/types";
import type { AppointmentListItem, AppointmentSummary } from "../types";
import { withDisplayStatus } from "../utils";

interface UseAppointmentsReturn {
  appointments: AppointmentListItem[];
  upcomingAppointments: AppointmentListItem[];
  overdueAppointments: AppointmentListItem[];
  attendedAppointments: AppointmentListItem[];
  summary: AppointmentSummary;
  isLoading: boolean;
  refresh: () => void;
}

export function useAppointments(): UseAppointmentsReturn {
  const { baby } = useBaby();
  const [storedAppointments, setStoredAppointments] = useState<PediatricAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => subscribeToDataSync(refresh), [refresh]);

  useEffect(() => {
    if (!baby) {
      setStoredAppointments([]);
      setIsLoading(false);
      return;
    }

    const babyId = baby.id;
    const cacheKey = `appointments:${babyId}`;
    const cached = readViewCache<PediatricAppointment[]>(cacheKey);
    let cancelled = false;

    if (cached) {
      setStoredAppointments(cached);
      setIsLoading(false);
      setNow(new Date());
    } else {
      setIsLoading(true);
    }

    async function loadAppointments() {
      try {
        const result = await loadViewCache(cacheKey, () =>
          getAppointmentsByBabyId(babyId)
        );

        if (!cancelled) {
          setStoredAppointments(result);
          setNow(new Date());
        }
      } catch (error) {
        console.error("[useAppointments] Failed to load:", error);
        if (!cancelled) {
          setStoredAppointments([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, [baby, refreshKey]);

  useEffect(() => {
    const syncNow = () => {
      setNow(new Date());
    };

    const intervalId = setInterval(syncNow, 60_000);
    window.addEventListener("focus", syncNow);
    document.addEventListener("visibilitychange", syncNow);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", syncNow);
      document.removeEventListener("visibilitychange", syncNow);
    };
  }, []);

  const appointments = useMemo(
    () => storedAppointments.map((appointment) => withDisplayStatus(appointment, now)),
    [storedAppointments, now]
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter((appointment) => appointment.displayStatus === "scheduled"),
    [appointments]
  );

  const overdueAppointments = useMemo(
    () =>
      appointments.filter((appointment) => appointment.displayStatus === "overdue"),
    [appointments]
  );

  const attendedAppointments = useMemo(
    () =>
      [...appointments]
        .filter((appointment) => appointment.displayStatus === "attended")
        .sort((a, b) =>
          (b.attendedAt ?? b.updatedAt).localeCompare(a.attendedAt ?? a.updatedAt)
        ),
    [appointments]
  );

  const summary = useMemo<AppointmentSummary>(
    () => ({
      totalAppointments: appointments.length,
      upcomingAppointments: upcomingAppointments.length,
      overdueAppointments: overdueAppointments.length,
      attendedAppointments: attendedAppointments.length,
    }),
    [
      appointments.length,
      attendedAppointments.length,
      overdueAppointments.length,
      upcomingAppointments.length,
    ]
  );

  return {
    appointments,
    upcomingAppointments,
    overdueAppointments,
    attendedAppointments,
    summary,
    isLoading,
    refresh,
  };
}
