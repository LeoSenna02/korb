"use client";

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

const STORAGE_KEY = "korb_feeding_state";

interface PersistedFeedingState {
  startedAt: string;
  type: "left" | "right" | "bottle" | "both";
  leftSeconds: number;
  rightSeconds: number;
  isPaused: boolean;
}

function loadPersistedFeedingState(): PersistedFeedingState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedFeedingState;
  } catch {
    return null;
  }
}

function persistFeedingState(state: PersistedFeedingState | null) {
  if (state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface FeedingTimerContextValue {
  leftSeconds: number;
  rightSeconds: number;
  activeSide: "left" | "right";
  isActive: boolean;
  startedAt: string | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  switchSide: () => void;
}

const FeedingTimerContext = createContext<FeedingTimerContextValue | null>(null);

export function FeedingTimerProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [activeSide, setActiveSide] = useState<"left" | "right">("left");
  const [leftSeconds, setLeftSeconds] = useState(0);
  const [rightSeconds, setRightSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<string | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadPersistedFeedingState();
    if (saved) {
      setActiveSide("left");
      setLeftSeconds(saved.leftSeconds);
      setRightSeconds(saved.rightSeconds);
      startedAtRef.current = saved.startedAt;
      setStartedAt(saved.startedAt);
      setIsActive(!saved.isPaused);
    }
  }, []);

  // Run interval when active
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (activeSide === "left") {
          setLeftSeconds((prev) => prev + 1);
        } else {
          setRightSeconds((prev) => prev + 1);
        }
      }, 1000);
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
  }, [isActive, activeSide]);

  // Persist state when it changes
  useEffect(() => {
    if (leftSeconds > 0 || rightSeconds > 0 || startedAt) {
      persistFeedingState({
        startedAt: startedAtRef.current || new Date().toISOString(),
        type: "both",
        leftSeconds,
        rightSeconds,
        isPaused: !isActive,
      });
    }
  }, [leftSeconds, rightSeconds, isActive, startedAt]);

  const start = useCallback(() => {
    if (!startedAtRef.current) {
      startedAtRef.current = new Date().toISOString();
      setStartedAt(startedAtRef.current);
    }
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const resume = useCallback(() => {
    setIsActive(true);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setLeftSeconds(0);
    setRightSeconds(0);
    setActiveSide("left");
    startedAtRef.current = null;
    setStartedAt(null);
    persistFeedingState(null);
  }, []);

  const switchSide = useCallback(() => {
    setActiveSide((prev) => (prev === "left" ? "right" : "left"));
  }, []);

  const value: FeedingTimerContextValue = {
    leftSeconds,
    rightSeconds,
    activeSide,
    isActive,
    startedAt,
    start,
    pause,
    resume,
    reset,
    switchSide,
  };

  return (
    <FeedingTimerContext.Provider value={value}>
      {children}
    </FeedingTimerContext.Provider>
  );
}

export function useFeedingTimer(): FeedingTimerContextValue {
  const ctx = useContext(FeedingTimerContext);
  if (!ctx) {
    throw new Error("useFeedingTimer must be used inside FeedingTimerProvider");
  }
  return ctx;
}