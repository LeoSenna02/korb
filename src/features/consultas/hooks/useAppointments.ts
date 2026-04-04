"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { getAppointmentsByBabyId } from "@/lib/db/repositories/appointment";
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
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!baby) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    const babyId = baby.id;
    let cancelled = false;

    async function loadAppointments() {
      setIsLoading(true);

      try {
        const result = await getAppointmentsByBabyId(babyId);

        if (!cancelled) {
          const now = new Date();
          setAppointments(result.map((appointment) => withDisplayStatus(appointment, now)));
        }
      } catch (error) {
        console.error("[useAppointments] Failed to load:", error);
        if (!cancelled) {
          setAppointments([]);
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
