"use client";

import { Play, Pause, RotateCcw, ArrowLeftRight } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

interface FeedingTimerProps {
  onTimeChange?: (seconds: number) => void;
  onLeftSecondsChange?: (seconds: number) => void;
  onRightSecondsChange?: (seconds: number) => void;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  dual?: boolean;
  initialLeftSeconds?: number;
  initialRightSeconds?: number;
}

type ActiveSide = "left" | "right";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function SingleTimer({ isActive, elapsedSeconds, onToggle, onReset }: {
  isActive: boolean;
  elapsedSeconds: number;
  onToggle: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center mb-12">
      <div className="font-display text-[64px] leading-none text-text-primary mb-10 tracking-tight font-light">
        {formatTime(elapsedSeconds)}
      </div>

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
}: {
  leftSeconds: number;
  rightSeconds: number;
  activeSide: ActiveSide;
  isActive: boolean;
  onToggle: () => void;
  onSwitch: () => void;
  onReset: () => void;
}) {
  const totalSeconds = leftSeconds + rightSeconds;
  const isLeftActive = activeSide === "left";
  const isRightActive = activeSide === "right";

  return (
    <div className="flex flex-col items-center mb-8">
      {/* Side timers */}
      <div className="flex items-center gap-3 w-full mb-8 min-w-0">
        {/* Left timer */}
        <button
          onClick={isLeftActive ? onToggle : onSwitch}
          className={`flex-1 min-w-0 flex flex-col items-center py-5 px-2 rounded-2xl transition-all duration-300 ${
            isLeftActive && isActive
              ? "bg-primary/10 border border-primary/30"
              : isLeftActive
              ? "bg-surface-variant/20 border border-outline-variant/20"
              : "bg-surface-container-low border border-transparent opacity-60"
          }`}
        >
          <span className="font-data text-[10px] text-text-disabled uppercase tracking-widest mb-2">
            Esquerdo
          </span>
          <span className={`font-display text-[28px] sm:text-[32px] font-light tabular-nums ${isLeftActive ? "text-primary" : "text-text-secondary"}`}>
            {formatTime(leftSeconds)}
          </span>
          {isLeftActive && isActive && (
            <div className="mt-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </button>

        {/* Switch button */}
        <button
          onClick={onSwitch}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface-variant/30 border border-outline-variant/20 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-variant/50 transition-all active:scale-95 flex-shrink-0"
        >
          <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
        </button>

        {/* Right timer */}
        <button
          onClick={isRightActive ? onToggle : onSwitch}
          className={`flex-1 min-w-0 flex flex-col items-center py-5 px-2 rounded-2xl transition-all duration-300 ${
            isRightActive && isActive
              ? "bg-primary/10 border border-primary/30"
              : isRightActive
              ? "bg-surface-variant/20 border border-outline-variant/20"
              : "bg-surface-container-low border border-transparent opacity-60"
          }`}
        >
          <span className="font-data text-[10px] text-text-disabled uppercase tracking-widest mb-2">
            Direito
          </span>
          <span className={`font-display text-[28px] sm:text-[32px] font-light tabular-nums ${isRightActive ? "text-primary" : "text-text-secondary"}`}>
            {formatTime(rightSeconds)}
          </span>
          {isRightActive && isActive && (
            <div className="mt-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </button>
      </div>

      {/* Total time */}
      <div className="flex flex-col items-center mb-6 px-4 py-3 bg-surface-container-low rounded-2xl w-full max-w-[280px] mx-auto">
        <span className="font-data text-[10px] text-text-disabled uppercase tracking-widest mb-1.5">
          Tempo Total
        </span>
        <span className="font-display text-[24px] sm:text-[28px] font-light text-text-primary tabular-nums">
          {formatTime(totalSeconds)}
        </span>
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
  onResume,
  onStop,
  dual,
  initialLeftSeconds = 0,
  initialRightSeconds = 0,
}: FeedingTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [activeSide, setActiveSide] = useState<ActiveSide>("left");
  const [leftSeconds, setLeftSeconds] = useState(initialLeftSeconds);
  const [rightSeconds, setRightSeconds] = useState(initialRightSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (activeSide === "left") {
          setLeftSeconds((prev) => prev + 1);
        } else {
          setRightSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, activeSide]);

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
    setIsActive((prev) => {
      const next = !prev;
      if (next) {
        onStart?.();
      } else {
        onPause?.();
      }
      return next;
    });
  }, [onStart, onPause]);

  const switchSide = useCallback(() => {
    if (activeSide === "left") {
      setActiveSide("right");
    } else {
      setActiveSide("left");
    }
  }, [activeSide]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setLeftSeconds(0);
    setRightSeconds(0);
    setActiveSide("left");
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
