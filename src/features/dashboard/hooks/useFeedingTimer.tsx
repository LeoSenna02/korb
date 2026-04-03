"use client";

import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";

const STORAGE_KEY = "korb_feeding_state";

interface PersistedFeedingState {
  startedAt: string;
  type: "left" | "right" | "bottle" | "both";
  activeSide: "left" | "right";
  leftSeconds: number;
  rightSeconds: number;
  isPaused: boolean;
  updatedAt: string;
}

interface InitialFeedingTimerState {
  activeSide: "left" | "right";
  leftSeconds: number;
  rightSeconds: number;
  isActive: boolean;
  startedAt: string | null;
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

function applyElapsedWhileAway(
  state: PersistedFeedingState
): Pick<PersistedFeedingState, "leftSeconds" | "rightSeconds"> {
  if (state.isPaused) {
    return {
      leftSeconds: state.leftSeconds,
      rightSeconds: state.rightSeconds,
    };
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(state.updatedAt).getTime()) / 1000)
  );

  if (elapsedSeconds === 0) {
    return {
      leftSeconds: state.leftSeconds,
      rightSeconds: state.rightSeconds,
    };
  }

  if (state.activeSide === "left") {
    return {
      leftSeconds: state.leftSeconds + elapsedSeconds,
      rightSeconds: state.rightSeconds,
    };
  }

  return {
    leftSeconds: state.leftSeconds,
    rightSeconds: state.rightSeconds + elapsedSeconds,
  };
}

function getInitialFeedingTimerState(): InitialFeedingTimerState {
  if (typeof window === "undefined") {
    return {
      activeSide: "left",
      leftSeconds: 0,
      rightSeconds: 0,
      isActive: false,
      startedAt: null,
    };
  }

  const saved = loadPersistedFeedingState();
  if (!saved) {
    return {
      activeSide: "left",
      leftSeconds: 0,
      rightSeconds: 0,
      isActive: false,
      startedAt: null,
    };
  }

  const hydratedState = applyElapsedWhileAway(saved);

  return {
    activeSide: saved.activeSide,
    leftSeconds: hydratedState.leftSeconds,
    rightSeconds: hydratedState.rightSeconds,
    isActive: !saved.isPaused,
    startedAt: saved.startedAt,
  };
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
  const [initialState] = useState(getInitialFeedingTimerState);
  const [isActive, setIsActive] = useState(initialState.isActive);
  const [activeSide, setActiveSide] = useState<"left" | "right">(
    initialState.activeSide
  );
  const [leftSeconds, setLeftSeconds] = useState(initialState.leftSeconds);
  const [rightSeconds, setRightSeconds] = useState(initialState.rightSeconds);
  const [startedAt, setStartedAt] = useState<string | null>(initialState.startedAt);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<string | null>(initialState.startedAt);

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
        activeSide,
        leftSeconds,
        rightSeconds,
        isPaused: !isActive,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [leftSeconds, rightSeconds, activeSide, isActive, startedAt]);

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

  const value = useMemo<FeedingTimerContextValue>(
    () => ({
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
    }),
    [leftSeconds, rightSeconds, activeSide, isActive, startedAt, start, pause, resume, reset, switchSide]
  );

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
