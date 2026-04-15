"use client";

import React,
  {
    createContext,
    useCallback,
    useMemo,
    useRef,
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

function createOptimisticSleepSession(params: {
  babyId: string;
  type: SleepType;
  previousSession: SleepSessionActionResult["session"];
}): SleepSessionActionResult["session"] {
  const now = new Date().toISOString();
  const fallbackUserId =
    params.previousSession?.updatedBy ??
    params.previousSession?.startedBy ??
    "local-user";

  return {
    babyId: params.babyId,
    type: params.type,
    startedAt: now,
    isPaused: false,
    pausedTotalMs: 0,
    startedBy: params.previousSession?.startedBy ?? fallbackUserId,
    updatedBy: fallbackUserId,
    createdAt: now,
    updatedAt: now,
  };
}

export function SleepProvider({ children }: SleepProviderProps) {
  const { baby } = useBaby();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mutationIdRef = useRef(0);
  const { session, elapsedSeconds, applySession, clearSession, refreshSession } =
    useSharedSleepSession(baby?.id ?? null);

  const getActionErrorMessage = useCallback(() => {
    if (!baby) {
      return "Selecione um bebe para registrar o sono.";
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return "Conecte-se a internet para compartilhar o timer de sono.";
    }

    return null;
  }, [baby]);

  const runSleepAction = useCallback(
    async (
      action: () => Promise<SleepSessionActionResult>,
      options?: {
        onSuccess?: (result: SleepSessionActionResult) => void;
        optimisticUpdate?: () => void;
        rollback?: () => void;
      }
    ) => {
      const preconditionError = getActionErrorMessage();
      if (preconditionError) {
        setErrorMessage(preconditionError);
        throw new Error(preconditionError);
      }

      const mutationId = ++mutationIdRef.current;
      let handledFailure = false;

      options?.optimisticUpdate?.();
      setErrorMessage(null);

      try {
        const result = await action();
        if (!result.success) {
          handledFailure = true;
          const message = result.message ?? "Erro ao atualizar a sessao de sono.";

          if (mutationId === mutationIdRef.current) {
            setErrorMessage(message);

            if (result.errorCode === "NO_ACTIVE_SESSION") {
              clearSession();
              await refreshSession();
            } else {
              options?.rollback?.();
            }
          }

          throw new Error(message);
        }

        if (mutationId !== mutationIdRef.current) {
          return;
        }

        if (result.session) {
          applySession(result.session);
        } else {
          clearSession();
        }

        options?.onSuccess?.(result);
      } catch (error) {
        if (!handledFailure && mutationId === mutationIdRef.current) {
          options?.rollback?.();
        }

        throw error;
      }
    },
    [applySession, clearSession, getActionErrorMessage, refreshSession]
  );

  const restoreSession = useCallback(
    (previousSession: SleepSessionActionResult["session"]) => {
      if (previousSession) {
        applySession(previousSession);
        return;
      }

      clearSession();
    },
    [applySession, clearSession]
  );

  const startSleep = useCallback((type: SleepType = "nap") => {
    if (!baby) {
      setErrorMessage("Selecione um bebe para registrar o sono.");
      return;
    }

    const previousSession = session;
    const optimisticSession = createOptimisticSleepSession({
      babyId: baby.id,
      type,
      previousSession,
    });

    void runSleepAction(
      () =>
        startSleepSessionAction({
          babyId: baby.id,
          type,
        }),
      {
        optimisticUpdate: () => applySession(optimisticSession),
        rollback: () => restoreSession(previousSession),
      }
    ).catch(() => undefined);
  }, [applySession, baby, restoreSession, runSleepAction, session]);

  const pauseSleep = useCallback(() => {
    if (!baby) {
      setErrorMessage("Selecione um bebe para registrar o sono.");
      return;
    }

    if (!session || session.isPaused) {
      return;
    }

    const previousSession = session;
    const pausedAt = new Date().toISOString();

    void runSleepAction(
      () =>
        pauseSleepSessionAction({
          babyId: baby.id,
        }),
      {
        optimisticUpdate: () =>
          applySession({
            ...previousSession,
            isPaused: true,
            pauseStartedAt: pausedAt,
            updatedAt: pausedAt,
          }),
        rollback: () => restoreSession(previousSession),
      }
    ).catch(() => undefined);
  }, [applySession, baby, restoreSession, runSleepAction, session]);

  const resumeSleep = useCallback(() => {
    if (!baby) {
      setErrorMessage("Selecione um bebe para registrar o sono.");
      return;
    }

    if (!session || !session.isPaused) {
      return;
    }

    const previousSession = session;
    const resumedAtMs = Date.now();
    const resumedAt = new Date(resumedAtMs).toISOString();
    const pauseStartedAtMs = previousSession.pauseStartedAt
      ? new Date(previousSession.pauseStartedAt).getTime()
      : resumedAtMs;
    const additionalPausedMs = Math.max(0, resumedAtMs - pauseStartedAtMs);

    void runSleepAction(
      () =>
        resumeSleepSessionAction({
          babyId: baby.id,
        }),
      {
        optimisticUpdate: () =>
          applySession({
            ...previousSession,
            isPaused: false,
            pauseStartedAt: undefined,
            pausedTotalMs: previousSession.pausedTotalMs + additionalPausedMs,
            updatedAt: resumedAt,
          }),
        rollback: () => restoreSession(previousSession),
      }
    ).catch(() => undefined);
  }, [applySession, baby, restoreSession, runSleepAction, session]);

  const stopSleep = useCallback(() => {
    if (!baby) {
      setErrorMessage("Selecione um bebe para registrar o sono.");
      return;
    }

    const previousSession = session;

    void runSleepAction(
      () =>
        cancelSleepSessionAction({
          babyId: baby.id,
        }),
      {
        optimisticUpdate: () => clearSession(),
        rollback: () => restoreSession(previousSession),
      }
    ).catch(() => undefined);
  }, [baby, clearSession, restoreSession, runSleepAction, session]);

  const endSleep = useCallback(
    async (notes?: string) => {
      if (!baby) {
        const message = "Selecione um bebe para registrar o sono.";
        setErrorMessage(message);
        throw new Error(message);
      }

      const previousSession = session;

      await runSleepAction(
        () =>
          completeSleepSessionAction({
            babyId: baby.id,
            notes,
          }),
        {
          optimisticUpdate: () => clearSession(),
          rollback: () => restoreSession(previousSession),
        }
      );
    },
    [baby, clearSession, restoreSession, runSleepAction, session]
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
