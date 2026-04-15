"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";
import type { ActiveSleepSession } from "../types";

interface UseSharedSleepSessionReturn {
  session: ActiveSleepSession | null;
  elapsedSeconds: number;
  isLoading: boolean;
  applySession: (session: ActiveSleepSession | null) => void;
  clearSession: () => void;
  refreshSession: () => Promise<void>;
}

function mapSessionRow(row: Tables<"sleep_sessions">): ActiveSleepSession {
  return {
    babyId: row.baby_id,
    type: row.type as ActiveSleepSession["type"],
    startedAt: row.started_at,
    isPaused: row.is_paused,
    pausedTotalMs: row.paused_total_ms,
    pauseStartedAt: row.pause_started_at ?? undefined,
    startedBy: row.started_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getElapsedSeconds(session: ActiveSleepSession, nowMs: number): number {
  const startedAtMs = new Date(session.startedAt).getTime();
  const activeEndMs =
    session.isPaused && session.pauseStartedAt
      ? new Date(session.pauseStartedAt).getTime()
      : nowMs;

  if (!Number.isFinite(startedAtMs) || !Number.isFinite(activeEndMs)) {
    return 0;
  }

  const elapsedMs = activeEndMs - startedAtMs - session.pausedTotalMs;
  return Math.max(0, Math.floor(elapsedMs / 1000));
}

function getNextElapsedSecondDelay(session: ActiveSleepSession, nowMs: number): number {
  const startedAtMs = new Date(session.startedAt).getTime();
  if (!Number.isFinite(startedAtMs)) {
    return 1000;
  }

  const elapsedMs = Math.max(0, nowMs - startedAtMs - session.pausedTotalMs);
  const remainder = elapsedMs % 1000;
  return remainder === 0 ? 1000 : 1000 - remainder;
}

export function useSharedSleepSession(
  babyId: string | null
): UseSharedSleepSessionReturn {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<ActiveSleepSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const syncElapsedTime = useCallback((nextSession: ActiveSleepSession | null) => {
    setElapsedSeconds(
      nextSession ? getElapsedSeconds(nextSession, Date.now()) : 0
    );
  }, []);

  const refreshSession = useCallback(async () => {
    if (!babyId) {
      setSession(null);
      setElapsedSeconds(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("sleep_sessions")
        .select("*")
        .eq("baby_id", babyId)
        .maybeSingle();

      if (error) {
        console.warn("[useSharedSleepSession] Failed to fetch session:", error);
        setSession(null);
        setElapsedSeconds(0);
        return;
      }

      const nextSession = data ? mapSessionRow(data) : null;
      setSession(nextSession);
      syncElapsedTime(nextSession);
    } finally {
      setIsLoading(false);
    }
  }, [babyId, supabase, syncElapsedTime]);

  const applySession = useCallback((nextSession: ActiveSleepSession | null) => {
    setSession(nextSession);
    syncElapsedTime(nextSession);
    setIsLoading(false);
  }, [syncElapsedTime]);

  const clearSession = useCallback(() => {
    setSession(null);
    setElapsedSeconds(0);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const channel = supabase
      .channel(`sleep-session:${babyId ?? "none"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sleep_sessions" },
        () => {
          void refreshSession();
        }
      )
      .subscribe();

    const handleRefresh = () => {
      if (document.visibilityState === "hidden") {
        return;
      }

      void refreshSession();
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("pageshow", handleRefresh);
    window.addEventListener("online", handleRefresh);
    document.addEventListener("visibilitychange", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("pageshow", handleRefresh);
      window.removeEventListener("online", handleRefresh);
      document.removeEventListener("visibilitychange", handleRefresh);
      void supabase.removeChannel(channel);
    };
  }, [babyId, refreshSession, supabase]);

  useEffect(() => {
    syncElapsedTime(session);

    if (!session || session.isPaused) {
      return;
    }

    let intervalId: number | null = null;
    const timeoutId = window.setTimeout(() => {
      syncElapsedTime(session);
      intervalId = window.setInterval(() => {
        syncElapsedTime(session);
      }, 1000);
    }, getNextElapsedSecondDelay(session, Date.now()));

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [session, syncElapsedTime]);

  return {
    session,
    elapsedSeconds,
    isLoading,
    applySession,
    clearSession,
    refreshSession,
  };
}
