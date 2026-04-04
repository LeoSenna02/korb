"use client";

import React,
  {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
import { useBaby } from "./BabyContext";
import { saveSleep } from "@/lib/db/repositories";
import type { SleepType } from "@/lib/db/types";

interface SleepContextValue {
  isActive: boolean;
  isPaused: boolean;
  startedAt: string | null;
  sleepType: SleepType;
  elapsedSeconds: number;
  startSleep: (type?: SleepType) => void;
  endSleep: (notes?: string) => Promise<void>;
  pauseSleep: () => void;
  resumeSleep: () => void;
  stopSleep: () => void;
}

const SleepContext = createContext<SleepContextValue | null>(null);

const STORAGE_KEY = "korb_sleep_state";

interface PersistedSleepState {
  startedAt: string;
  sleepType: SleepType;
  isPaused: boolean;
  pausedDurationMs: number;
  pauseStartTime: number | null;
}

interface InitialSleepState {
  startedAt: string | null;
  sleepType: SleepType;
  elapsedSeconds: number;
  isPaused: boolean;
  pausedDurationMs: number;
  pauseStartTime: number | null;
}

function loadPersistedState(): PersistedSleepState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSleepState;
  } catch {
    return null;
  }
}

function persistState(state: PersistedSleepState | null) {
  if (state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function getInitialSleepState(): InitialSleepState {
  if (typeof window === "undefined") {
    return {
      startedAt: null,
      sleepType: "nap",
      elapsedSeconds: 0,
      isPaused: false,
      pausedDurationMs: 0,
      pauseStartTime: null,
    };
  }

  const saved = loadPersistedState();
  if (!saved) {
    return {
      startedAt: null,
      sleepType: "nap",
      elapsedSeconds: 0,
      isPaused: false,
      pausedDurationMs: 0,
      pauseStartTime: null,
    };
  }

  const elapsed = Math.floor(
    (Date.now() -
      new Date(saved.startedAt).getTime() -
      saved.pausedDurationMs -
      (saved.isPaused && saved.pauseStartTime
        ? Date.now() - saved.pauseStartTime
        : 0)) / 1000
  );

  return {
    startedAt: saved.startedAt,
    sleepType: saved.sleepType,
    elapsedSeconds: Math.max(0, elapsed),
    isPaused: saved.isPaused,
    pausedDurationMs: saved.pausedDurationMs,
    pauseStartTime: saved.pauseStartTime,
  };
}

interface SleepProviderProps {
  children: React.ReactNode;
}

export function SleepProvider({ children }: SleepProviderProps) {
  const { baby } = useBaby();
  const [initialState] = useState(getInitialSleepState);
  const [startedAt, setStartedAt] = useState<string | null>(initialState.startedAt);
  const [sleepType, setSleepType] = useState<SleepType>(initialState.sleepType);
  const [elapsedSeconds, setElapsedSeconds] = useState(initialState.elapsedSeconds);
  const [isPaused, setIsPaused] = useState(initialState.isPaused);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedDurationRef = useRef(initialState.pausedDurationMs);
  const pauseStartTimeRef = useRef<number | null>(initialState.pauseStartTime);

  useEffect(() => {
    if (startedAt) {
      persistState({
        startedAt,
        sleepType,
        isPaused,
        pausedDurationMs: pausedDurationRef.current,
        pauseStartTime: pauseStartTimeRef.current,
      });
    } else {
      persistState(null);
    }
  }, [startedAt, sleepType, isPaused]);

  const syncElapsedSeconds = useCallback(() => {
    if (!startedAt || isPaused) {
      return;
    }

    const elapsed = Math.floor(
      (Date.now() - new Date(startedAt).getTime() - pausedDurationRef.current) / 1000
    );
    setElapsedSeconds(Math.max(0, elapsed));
  }, [startedAt, isPaused]);

  useEffect(() => {
    if (startedAt && !isPaused) {
      syncElapsedSeconds();
      intervalRef.current = setInterval(syncElapsedSeconds, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startedAt, isPaused, syncElapsedSeconds]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      syncElapsedSeconds();
    };

    window.addEventListener("focus", syncElapsedSeconds);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", syncElapsedSeconds);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncElapsedSeconds]);

  const startSleep = useCallback((type: SleepType = "nap") => {
    setStartedAt(new Date().toISOString());
    setSleepType(type);
    setElapsedSeconds(0);
    setIsPaused(false);
    pausedDurationRef.current = 0;
    pauseStartTimeRef.current = null;
  }, []);

  const pauseSleep = useCallback(() => {
    if (!startedAt || isPaused) return;
    syncElapsedSeconds();
    pauseStartTimeRef.current = Date.now();
    setIsPaused(true);
  }, [startedAt, isPaused, syncElapsedSeconds]);

  const resumeSleep = useCallback(() => {
    if (!isPaused) return;
    if (pauseStartTimeRef.current) {
      pausedDurationRef.current += Date.now() - pauseStartTimeRef.current;
      pauseStartTimeRef.current = null;
    }
    setIsPaused(false);
  }, [isPaused]);

  const stopSleep = useCallback(() => {
    setStartedAt(null);
    setElapsedSeconds(0);
    setIsPaused(false);
    pausedDurationRef.current = 0;
    pauseStartTimeRef.current = null;
  }, []);

  const endSleep = useCallback(
    async (notes?: string) => {
      if (!startedAt || !baby) return;

      const totalPaused = pausedDurationRef.current +
        (isPaused && pauseStartTimeRef.current
          ? Date.now() - pauseStartTimeRef.current
          : 0);

      const effectiveDuration =
        Date.now() - new Date(startedAt).getTime() - totalPaused;
      const endedAt = new Date(
        new Date(startedAt).getTime() + effectiveDuration
      ).toISOString();

      await saveSleep({
        babyId: baby.id,
        type: sleepType,
        startedAt,
        endedAt,
        notes,
      });

      setStartedAt(null);
      setElapsedSeconds(0);
      setIsPaused(false);
      pausedDurationRef.current = 0;
      pauseStartTimeRef.current = null;
    },
    [startedAt, baby, sleepType, isPaused]
  );

  const value = useMemo<SleepContextValue>(
    () => ({
      isActive: startedAt !== null,
      isPaused,
      startedAt,
      sleepType,
      elapsedSeconds,
      startSleep,
      endSleep,
      pauseSleep,
      resumeSleep,
      stopSleep,
    }),
    [startedAt, isPaused, sleepType, elapsedSeconds, startSleep, endSleep, pauseSleep, resumeSleep, stopSleep]
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
