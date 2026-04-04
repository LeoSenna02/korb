"use client";

import { Play, Pause, RotateCcw, ArrowLeftRight } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { TimerValue } from "./TimerValue";
import { useLowPerformanceMode } from "@/lib/hooks/useLowPerformanceMode";

interface FeedingTimerProps {
  onTimeChange?: (seconds: number) => void;
  onLeftSecondsChange?: (seconds: number) => void;
  onRightSecondsChange?: (seconds: number) => void;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  dual?: boolean;
  initialLeftSeconds?: number;
  initialRightSeconds?: number;
}

type ActiveSide = "left" | "right";

interface FeedingTimerState {
  isActive: boolean;
  activeSide: ActiveSide;
  leftSeconds: number;
  rightSeconds: number;
  segmentStartedAt: string | null;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
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

function SingleTimer({ isActive, elapsedSeconds, onToggle, onReset }: {
  isActive: boolean;
  elapsedSeconds: number;
  onToggle: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center mb-12">
      <TimerValue
        value={formatTime(elapsedSeconds)}
        className="font-display text-[64px] text-text-primary mb-10 tracking-tight font-light"
      />

      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className="w-24 h-24 rounded-full bg-surface-variant/30 border border-outline-variant/20 flex items-center justify-center text-primary hover:bg-surface-variant/50 transition-all active:scale-95 group"
        >
          <div className="w-20 h-20 rounded-full bg-surface-variant/20 flex items-center justify-center group-hover:bg-surface-variant/30 transition-colors">
            {isActive ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </div>
        </button>

        {elapsedSeconds > 0 && !isActive && (
          <button
            onClick={onReset}
            className="w-12 h-12 rounded-full bg-surface-variant/20 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-variant/30 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function DualTimer({
  leftSeconds,
  rightSeconds,
  activeSide,
  isActive,
  onToggle,
  onSwitch,
  onReset,
  animateValue = false,
}: {
  leftSeconds: number;
  rightSeconds: number;
  activeSide: ActiveSide;
  isActive: boolean;
  onToggle: () => void;
  onSwitch: () => void;
  onReset: () => void;
  animateValue?: boolean;
}) {
  const totalSeconds = leftSeconds + rightSeconds;
  const isLeftActive = activeSide === "left";
  const isRightActive = activeSide === "right";
  const lowPerformanceMode = useLowPerformanceMode();

  return (
    <div className="flex flex-col items-center mb-8">
      {/* Side timers */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3 w-full mb-8 min-w-0">
        {/* Left timer */}
        <button
          onClick={isLeftActive ? onToggle : onSwitch}
          className={`min-w-0 flex flex-col items-center justify-center py-4 sm:py-5 px-2 sm:px-3 rounded-2xl transition-all duration-300 ${
            isLeftActive && isActive
              ? "bg-primary/10 border border-primary/30"
              : isLeftActive
              ? "bg-surface-variant/20 border border-outline-variant/20"
              : "bg-surface-container-low border border-transparent opacity-60"
          }`}
        >
          <span className="font-data text-[9px] sm:text-[10px] text-text-disabled uppercase tracking-[0.18em] mb-2 text-center">
            Esquerdo
          </span>
          <TimerValue
            value={formatTime(leftSeconds)}
            animated={animateValue}
            className={`w-full justify-center font-display text-[18px] min-[360px]:text-[20px] sm:text-[28px] font-light leading-none tracking-tight ${
              isLeftActive ? "text-primary" : "text-text-secondary"
            }`}
          />
          {isLeftActive && isActive && (
            <div className={`mt-1.5 w-2 h-2 rounded-full bg-primary ${lowPerformanceMode ? "" : "animate-pulse"}`} />
          )}
        </button>

        {/* Switch button */}
        <button
          onClick={onSwitch}
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-surface-variant/30 border border-outline-variant/20 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-variant/50 transition-all active:scale-95 flex-shrink-0"
        >
          <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
        </button>

        {/* Right timer */}
        <button
          onClick={isRightActive ? onToggle : onSwitch}
          className={`min-w-0 flex flex-col items-center justify-center py-4 sm:py-5 px-2 sm:px-3 rounded-2xl transition-all duration-300 ${
            isRightActive && isActive
              ? "bg-primary/10 border border-primary/30"
              : isRightActive
              ? "bg-surface-variant/20 border border-outline-variant/20"
              : "bg-surface-container-low border border-transparent opacity-60"
          }`}
        >
          <span className="font-data text-[9px] sm:text-[10px] text-text-disabled uppercase tracking-[0.18em] mb-2 text-center">
            Direito
          </span>
          <TimerValue
            value={formatTime(rightSeconds)}
            animated={animateValue}
            className={`w-full justify-center font-display text-[18px] min-[360px]:text-[20px] sm:text-[28px] font-light leading-none tracking-tight ${
              isRightActive ? "text-primary" : "text-text-secondary"
            }`}
          />
          {isRightActive && isActive && (
            <div className={`mt-1.5 w-2 h-2 rounded-full bg-primary ${lowPerformanceMode ? "" : "animate-pulse"}`} />
          )}
        </button>
      </div>

      {/* Total time */}
      <div className="flex flex-col items-center mb-6 px-4 py-3 bg-surface-container-low rounded-2xl w-full max-w-[280px] mx-auto">
        <span className="font-data text-[10px] text-text-disabled uppercase tracking-widest mb-1.5">
          Tempo Total
        </span>
        <TimerValue
          value={formatTime(totalSeconds)}
          animated={animateValue}
          className="font-display text-[24px] sm:text-[28px] font-light text-text-primary"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggle}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/20 transition-all active:scale-95 group"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-surface-variant/20 flex items-center justify-center group-hover:bg-surface-variant/30 transition-colors">
            {isActive ? (
              <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-1" />
            )}
          </div>
        </button>

        {(leftSeconds > 0 || rightSeconds > 0) && !isActive && (
          <button
            onClick={onReset}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-variant/20 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-variant/30 transition-all"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function FeedingTimer({
  onTimeChange,
  onLeftSecondsChange,
  onRightSecondsChange,
  onStart,
  onPause,
  onStop,
  dual,
  initialLeftSeconds = 0,
  initialRightSeconds = 0,
}: FeedingTimerProps) {
  const [timerState, setTimerState] = useState<FeedingTimerState>({
    isActive: false,
    activeSide: "left",
    leftSeconds: initialLeftSeconds,
    rightSeconds: initialRightSeconds,
    segmentStartedAt: null,
  });

  const { isActive, activeSide, leftSeconds, rightSeconds } = timerState;

  const syncNow = useCallback(() => {
    setTimerState((currentState) => syncActiveSeconds(currentState));
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const intervalId = setInterval(syncNow, 1000);
    return () => clearInterval(intervalId);
  }, [isActive, syncNow]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      syncNow();
    };

    window.addEventListener("focus", syncNow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", syncNow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncNow]);

  useEffect(() => {
    const total = leftSeconds + rightSeconds;
    onTimeChange?.(total);
  }, [leftSeconds, rightSeconds, onTimeChange]);

  useEffect(() => {
    onLeftSecondsChange?.(leftSeconds);
  }, [leftSeconds, onLeftSecondsChange]);

  useEffect(() => {
    onRightSecondsChange?.(rightSeconds);
  }, [rightSeconds, onRightSecondsChange]);

  const toggleTimer = useCallback(() => {
    const now = new Date().toISOString();

    if (isActive) {
      onPause?.();
    } else {
      onStart?.();
    }

    setTimerState((currentState) => {
      if (currentState.isActive) {
        const pausedState = syncActiveSeconds(currentState);
        return {
          ...pausedState,
          isActive: false,
          segmentStartedAt: null,
        };
      }

      return {
        ...currentState,
        isActive: true,
        segmentStartedAt: now,
      };
    });
  }, [isActive, onStart, onPause]);

  const switchSide = useCallback(() => {
    const now = new Date().toISOString();

    setTimerState((currentState) => {
      const syncedState = syncActiveSeconds(currentState);

      return {
        ...syncedState,
        activeSide: syncedState.activeSide === "left" ? "right" : "left",
        segmentStartedAt: syncedState.isActive ? now : null,
      };
    });
  }, []);

  const resetTimer = useCallback(() => {
    setTimerState({
      isActive: false,
      activeSide: "left",
      leftSeconds: 0,
      rightSeconds: 0,
      segmentStartedAt: null,
    });
    onTimeChange?.(0);
    onLeftSecondsChange?.(0);
    onRightSecondsChange?.(0);
    onStop?.();
  }, [onTimeChange, onLeftSecondsChange, onRightSecondsChange, onStop]);

  if (dual) {
    return (
      <DualTimer
        leftSeconds={leftSeconds}
        rightSeconds={rightSeconds}
        activeSide={activeSide}
        isActive={isActive}
        onToggle={toggleTimer}
        onSwitch={switchSide}
        onReset={resetTimer}
      />
    );
  }

  return (
    <SingleTimer
      isActive={isActive}
      elapsedSeconds={activeSide === "left" ? leftSeconds : rightSeconds}
      onToggle={toggleTimer}
      onReset={resetTimer}
    />
  );
}
