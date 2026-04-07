"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "korb_feeding_state";

type FeedingSide = "left" | "right";
type FeedingType = FeedingSide | "bottle" | "both";

interface PersistedFeedingState {
  startedAt: string;
  type: FeedingType;
  activeSide: FeedingSide;
  leftSeconds: number;
  rightSeconds: number;
  isPaused: boolean;
  segmentStartedAt?: string | null;
  updatedAt?: string;
}

interface FeedingTimerState {
  activeSide: FeedingSide;
  leftSeconds: number;
  rightSeconds: number;
  isActive: boolean;
  startedAt: string | null;
  segmentStartedAt: string | null;
}

interface FeedingTimerContextValue {
  leftSeconds: number;
  rightSeconds: number;
  activeSide: FeedingSide;
  isActive: boolean;
  startedAt: string | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  switchSide: () => void;
}

const DEFAULT_TIMER_STATE: FeedingTimerState = {
  activeSide: "left",
  leftSeconds: 0,
  rightSeconds: 0,
  isActive: false,
  startedAt: null,
  segmentStartedAt: null,
};

const FeedingTimerContext = createContext<FeedingTimerContextValue | null>(null);

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
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

function buildPersistedFeedingState(
  state: FeedingTimerState
): PersistedFeedingState | null {
  if (
    state.leftSeconds === 0 &&
    state.rightSeconds === 0 &&
    state.startedAt === null
  ) {
    return null;
  }

  return {
    startedAt: state.startedAt ?? new Date().toISOString(),
    type: "both",
    activeSide: state.activeSide,
    leftSeconds: state.leftSeconds,
    rightSeconds: state.rightSeconds,
    isPaused: !state.isActive,
    segmentStartedAt: state.segmentStartedAt,
    updatedAt: new Date().toISOString(),
  };
}

function consumeElapsedSeconds(segmentStartedAt: string, nowMs: number) {
  const segmentStartedAtMs = new Date(segmentStartedAt).getTime();
  const elapsedMs = Math.max(0, nowMs - segmentStartedAtMs);
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  if (elapsedSeconds === 0) {
    return {
      elapsedSeconds: 0,
      nextSegmentStartedAt: segmentStartedAt,
    };
  }

  return {
    elapsedSeconds,
    nextSegmentStartedAt: new Date(segmentStartedAtMs + elapsedSeconds * 1000).toISOString(),
  };
}

function syncActiveSeconds(state: FeedingTimerState, nowMs = Date.now()): FeedingTimerState {
  if (!state.isActive || !state.segmentStartedAt) {
    return state;
  }

  const { elapsedSeconds, nextSegmentStartedAt } = consumeElapsedSeconds(
    state.segmentStartedAt,
    nowMs
  );

  if (elapsedSeconds === 0) {
    return state;
  }

  if (state.activeSide === "left") {
    return {
      ...state,
      leftSeconds: state.leftSeconds + elapsedSeconds,
      segmentStartedAt: nextSegmentStartedAt,
    };
  }

  return {
    ...state,
    rightSeconds: state.rightSeconds + elapsedSeconds,
    segmentStartedAt: nextSegmentStartedAt,
  };
}

function getInitialFeedingTimerState(): FeedingTimerState {
  if (typeof window === "undefined") {
    return DEFAULT_TIMER_STATE;
  }

  const saved = loadPersistedFeedingState();
  if (!saved) {
    return DEFAULT_TIMER_STATE;
  }

  const segmentStartedAt =
    saved.segmentStartedAt ?? (saved.isPaused ? null : saved.updatedAt ?? new Date().toISOString());

  return syncActiveSeconds({
    activeSide: saved.activeSide,
    leftSeconds: saved.leftSeconds,
    rightSeconds: saved.rightSeconds,
    isActive: !saved.isPaused,
    startedAt: saved.startedAt,
    segmentStartedAt,
  });
}

export function FeedingTimerProvider({ children }: { children: React.ReactNode }) {
  const [timerState, setTimerState] = useState<FeedingTimerState>(getInitialFeedingTimerState);
  const timerStateRef = useRef(timerState);

  const commitTimerState = useCallback(
    (updater: (currentState: FeedingTimerState) => FeedingTimerState) => {
      const nextState = updater(timerStateRef.current);
      timerStateRef.current = nextState;
      persistFeedingState(buildPersistedFeedingState(nextState));
      setTimerState(nextState);
      return nextState;
    },
    []
  );

  const syncNow = useCallback(() => {
    commitTimerState((currentState) => syncActiveSeconds(currentState));
  }, [commitTimerState]);

  const syncAndPersistNow = useCallback(() => {
    commitTimerState((currentState) => syncActiveSeconds(currentState));
  }, [commitTimerState]);

  useEffect(() => {
    if (!timerState.isActive) {
      return;
    }

    const intervalId = setInterval(syncNow, 1000);
    return () => clearInterval(intervalId);
  }, [timerState.isActive, syncNow]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        syncAndPersistNow();
        return;
      }

      syncNow();
    };

    const handlePageHide = () => {
      syncAndPersistNow();
    };

    const handlePageShow = () => {
      syncNow();
    };

    const handleBlur = () => {
      syncAndPersistNow();
    };

    window.addEventListener("focus", syncNow);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", syncNow);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncAndPersistNow, syncNow]);

  const start = useCallback(() => {
    const now = new Date().toISOString();

    commitTimerState((currentState) => {
      if (currentState.isActive) {
        return currentState;
      }

      return {
        ...currentState,
        isActive: true,
        startedAt: currentState.startedAt ?? now,
        segmentStartedAt: now,
      };
    });
  }, [commitTimerState]);

  const pause = useCallback(() => {
    commitTimerState((currentState) => {
      const syncedState = syncActiveSeconds(currentState);
      if (!syncedState.isActive) {
        return syncedState;
      }

      return {
        ...syncedState,
        isActive: false,
        segmentStartedAt: null,
      };
    });
  }, [commitTimerState]);

  const resume = useCallback(() => {
    const now = new Date().toISOString();

    commitTimerState((currentState) => {
      if (currentState.isActive) {
        return currentState;
      }

      return {
        ...currentState,
        isActive: true,
        startedAt: currentState.startedAt ?? now,
        segmentStartedAt: now,
      };
    });
  }, [commitTimerState]);

  const reset = useCallback(() => {
    timerStateRef.current = DEFAULT_TIMER_STATE;
    persistFeedingState(null);
    setTimerState(DEFAULT_TIMER_STATE);
  }, []);

  const switchSide = useCallback(() => {
    const now = new Date().toISOString();

    commitTimerState((currentState) => {
      const syncedState = syncActiveSeconds(currentState);

      return {
        ...syncedState,
        activeSide: syncedState.activeSide === "left" ? "right" : "left",
        segmentStartedAt: syncedState.isActive ? now : null,
      };
    });
  }, [commitTimerState]);

  const value = useMemo<FeedingTimerContextValue>(
    () => ({
      leftSeconds: timerState.leftSeconds,
      rightSeconds: timerState.rightSeconds,
      activeSide: timerState.activeSide,
      isActive: timerState.isActive,
      startedAt: timerState.startedAt,
      start,
      pause,
      resume,
      reset,
      switchSide,
    }),
    [timerState, start, pause, resume, reset, switchSide]
  );

  return <FeedingTimerContext.Provider value={value}>{children}</FeedingTimerContext.Provider>;
}

export function useFeedingTimer(): FeedingTimerContextValue {
  const ctx = useContext(FeedingTimerContext);
  if (!ctx) {
    throw new Error("useFeedingTimer must be used inside FeedingTimerProvider");
  }
  return ctx;
}
