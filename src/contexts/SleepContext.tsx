"use client";

import React,
  {
    createContext,
    useCallback,
    useMemo,
    useState,
  } from "react";
import { useBaby } from "./BabyContext";
import type { SleepType } from "@/lib/db/types";
import { useSharedSleepSession } from "@/features/sleep/hooks/useSharedSleepSession";
import {
  cancelSleepSessionAction,
  completeSleepSessionAction,
  pauseSleepSessionAction,
  resumeSleepSessionAction,
  startSleepSessionAction,
} from "@/features/sleep/actions/sleep-session";
import type { SleepSessionActionResult } from "@/features/sleep/types";

interface SleepContextValue {
  isActive: boolean;
  isPaused: boolean;
  startedAt: string | null;
  sleepType: SleepType;
  elapsedSeconds: number;
  errorMessage: string | null;
  startSleep: (type?: SleepType) => void;
  endSleep: (notes?: string) => Promise<void>;
  pauseSleep: () => void;
  resumeSleep: () => void;
  stopSleep: () => void;
}

const SleepContext = createContext<SleepContextValue | null>(null);

interface SleepProviderProps {
  children: React.ReactNode;
}

export function SleepProvider({ children }: SleepProviderProps) {
  const { baby } = useBaby();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { session, elapsedSeconds, applySession, clearSession, refreshSession } =
    useSharedSleepSession(baby?.id ?? null);

  const runSleepAction = useCallback(
    async (
      action: () => Promise<SleepSessionActionResult>,
      onSuccess?: (result: SleepSessionActionResult) => void
    ) => {
      if (!baby) {
        const message = "Selecione um bebe para registrar o sono.";
        setErrorMessage(message);
        throw new Error(message);
      }

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const message = "Conecte-se a internet para compartilhar o timer de sono.";
        setErrorMessage(message);
        throw new Error(message);
      }

      setErrorMessage(null);

      const result = await action();
      if (!result.success) {
        const message = result.message ?? "Erro ao atualizar a sessao de sono.";
        setErrorMessage(message);

        if (result.errorCode === "NO_ACTIVE_SESSION") {
          clearSession();
          await refreshSession();
        }

        throw new Error(message);
      }

      if (result.session) {
        applySession(result.session);
      } else {
        clearSession();
      }

      onSuccess?.(result);
    },
    [applySession, baby, clearSession, refreshSession]
  );

  const startSleep = useCallback((type: SleepType = "nap") => {
    if (!baby) {
      setErrorMessage("Selecione um bebe para registrar o sono.");
      return;
    }

    void runSleepAction(() =>
      startSleepSessionAction({
        babyId: baby.id,
        type,
      })
    ).catch(() => undefined);
  }, [baby, runSleepAction]);

  const pauseSleep = useCallback(() => {
    if (!baby) {
      setErrorMessage("Selecione um bebe para registrar o sono.");
      return;
    }

    void runSleepAction(() =>
      pauseSleepSessionAction({
        babyId: baby.id,
      })
    ).catch(() => undefined);
  }, [baby, runSleepAction]);

  const resumeSleep = useCallback(() => {
    if (!baby) {
      setErrorMessage("Selecione um bebe para registrar o sono.");
      return;
    }

    void runSleepAction(() =>
      resumeSleepSessionAction({
        babyId: baby.id,
      })
    ).catch(() => undefined);
  }, [baby, runSleepAction]);

  const stopSleep = useCallback(() => {
    if (!baby) {
      setErrorMessage("Selecione um bebe para registrar o sono.");
      return;
    }

    void runSleepAction(() =>
      cancelSleepSessionAction({
        babyId: baby.id,
      })
    ).catch(() => undefined);
  }, [baby, runSleepAction]);

  const endSleep = useCallback(
    async (notes?: string) => {
      if (!baby) {
        const message = "Selecione um bebe para registrar o sono.";
        setErrorMessage(message);
        throw new Error(message);
      }

      await runSleepAction(() =>
        completeSleepSessionAction({
          babyId: baby.id,
          notes,
        })
      );
    },
    [baby, runSleepAction]
  );

  const value = useMemo<SleepContextValue>(
    () => ({
      isActive: session !== null,
      isPaused: session?.isPaused ?? false,
      startedAt: session?.startedAt ?? null,
      sleepType: session?.type ?? "nap",
      elapsedSeconds,
      errorMessage,
      startSleep,
      endSleep,
      pauseSleep,
      resumeSleep,
      stopSleep,
    }),
    [session, elapsedSeconds, errorMessage, startSleep, endSleep, pauseSleep, resumeSleep, stopSleep]
  );

  return <SleepContext.Provider value={value}>{children}</SleepContext.Provider>;
}

export function useSleep(): SleepContextValue {
  const ctx = React.use(SleepContext);
  if (!ctx) {
    throw new Error("useSleep must be used inside SleepProvider");
  }
  return ctx;
}
