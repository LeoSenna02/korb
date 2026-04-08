"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { pullAllDataFromServer } from "./pull";

/**
 * Hook que gerencia realtime sync com Supabase.
 * Substitui a lógica que estava no AuthContext.
 *
 * Deve ser usado após o usuário estar autenticado.
 */
export function useRealtimeSync(userId: string | null) {
  const scheduledSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  if (!supabaseRef.current) {
    supabaseRef.current = createClient();
  }

  const supabase = supabaseRef.current;

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;
    let isSyncing = false;

    const syncFromServer = async () => {
      if (cancelled || isSyncing) {
        return;
      }

      isSyncing = true;

      try {
        await pullAllDataFromServer(supabase, userId);
      } catch (error) {
        console.warn("[useRealtimeSync] Session pull failed:", error);
      } finally {
        isSyncing = false;
      }
    };

    const scheduleSyncFromServer = () => {
      if (cancelled) {
        return;
      }

      if (scheduledSyncRef.current) {
        clearTimeout(scheduledSyncRef.current);
      }

      scheduledSyncRef.current = setTimeout(() => {
        scheduledSyncRef.current = null;
        void syncFromServer();
      }, 250);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleSyncFromServer();
      }
    };

    // Subscribe to all tables that affect user data
    const realtimeChannel = supabase
      .channel(`family-sync:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "baby_caregivers" },
        scheduleSyncFromServer
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "babies" },
        scheduleSyncFromServer
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedings" },
        scheduleSyncFromServer
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "diapers" },
        scheduleSyncFromServer
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "growth" },
        scheduleSyncFromServer
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sleeps" },
        scheduleSyncFromServer
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        scheduleSyncFromServer
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "milestones" },
        scheduleSyncFromServer
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vaccines" },
        scheduleSyncFromServer
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "symptom_episodes" },
        scheduleSyncFromServer
      )
      .subscribe();

    // Initial sync
    scheduleSyncFromServer();

    // Event listeners
    window.addEventListener("focus", scheduleSyncFromServer);
    window.addEventListener("online", scheduleSyncFromServer);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      cancelled = true;
      if (scheduledSyncRef.current) {
        clearTimeout(scheduledSyncRef.current);
        scheduledSyncRef.current = null;
      }
      window.removeEventListener("focus", scheduleSyncFromServer);
      window.removeEventListener("online", scheduleSyncFromServer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void supabase.removeChannel(realtimeChannel);
    };
  }, [userId, supabase]);
}
