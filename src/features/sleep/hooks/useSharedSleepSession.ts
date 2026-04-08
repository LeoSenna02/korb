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

export function useSharedSleepSession(
  babyId: string | null
): UseSharedSleepSessionReturn {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<ActiveSleepSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nowMs, setNowMs] = useState(Date.now());

  const refreshSession = useCallback(async () => {
    if (!babyId) {
      setSession(null);
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
        return;
      }

      setSession(data ? mapSessionRow(data) : null);
    } finally {
      setIsLoading(false);
      setNowMs(Date.now());
    }
  }, [babyId, supabase]);

  const applySession = useCallback((nextSession: ActiveSleepSession | null) => {
    setSession(nextSession);
    setNowMs(Date.now());
    setIsLoading(false);
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    setNowMs(Date.now());
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
      void refreshSession();
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("online", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("online", handleRefresh);
      void supabase.removeChannel(channel);
    };
  }, [babyId, refreshSession, supabase]);

  useEffect(() => {
    setNowMs(Date.now());

    if (!session || session.isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [session]);

  const elapsedSeconds = useMemo(() => {
    if (!session) {
      return 0;
    }

    return getElapsedSeconds(session, nowMs);
  }, [session, nowMs]);

  return {
    session,
    elapsedSeconds,
    isLoading,
    applySession,
    clearSession,
    refreshSession,
  };
}
