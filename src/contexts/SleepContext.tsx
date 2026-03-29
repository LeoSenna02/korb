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

interface SleepProviderProps {
  children: React.ReactNode;
}

export function SleepProvider({ children }: SleepProviderProps) {
  const { baby } = useBaby();
  const [initialized, setInitialized] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [sleepType, setSleepType] = useState<SleepType>("nap");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedDurationRef = useRef(0);
  const pauseStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = loadPersistedState();
    if (saved) {
      setStartedAt(saved.startedAt);
      setSleepType(saved.sleepType);
      setIsPaused(saved.isPaused);
      pausedDurationRef.current = saved.pausedDurationMs;
      pauseStartTimeRef.current = saved.pauseStartTime;

      const elapsed = Math.floor(
        (Date.now() - new Date(saved.startedAt).getTime() - saved.pausedDurationMs -
          (saved.isPaused && saved.pauseStartTime
            ? Date.now() - saved.pauseStartTime
            : 0)) / 1000
      );
      setElapsedSeconds(Math.max(0, elapsed));
    }
    setInitialized(true);
  }, []);

  const persistRef = useRef(persistState);
  persistRef.current = persistState;

  useEffect(() => {
    if (!initialized) return;
    if (startedAt) {
      persistRef.current({
        startedAt,
        sleepType,
        isPaused,
        pausedDurationMs: pausedDurationRef.current,
        pauseStartTime: pauseStartTimeRef.current,
      });
    } else {
      persistRef.current(null);
    }
  }, [initialized, startedAt, sleepType, isPaused]);

  const tick = useCallback(() => {
    if (startedAt) {
      const elapsed = Math.floor(
        (Date.now() - new Date(startedAt).getTime() - pausedDurationRef.current) / 1000
      );
      setElapsedSeconds(Math.max(0, elapsed));
    }
  }, [startedAt]);

  useEffect(() => {
    if (!initialized) return;
    if (startedAt && !isPaused) {
      intervalRef.current = setInterval(tick, 1000);
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
  }, [initialized, startedAt, isPaused, tick]);

  useEffect(() => {
    if (!startedAt) {
      const timer = setTimeout(() => setElapsedSeconds(0), 0);
      return () => clearTimeout(timer);
    }
  }, [startedAt]);

  const startSleep = useCallback((type: SleepType = "nap") => {
    setStartedAt(new Date().toISOString());
    setSleepType(type);
    setIsPaused(false);
    pausedDurationRef.current = 0;
    pauseStartTimeRef.current = null;
  }, []);

  const pauseSleep = useCallback(() => {
    if (!startedAt || isPaused) return;
    pauseStartTimeRef.current = Date.now();
    setIsPaused(true);
  }, [startedAt, isPaused]);

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
