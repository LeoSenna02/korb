"use client";

import { forwardRef, useState, useRef, useEffect, useCallback } from "react";

interface TimeInputProps {
  label: string;
  name?: string;
  error?: string;
  required?: boolean;
  initialValue?: string;
  onChange?: (time: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const ITEM_HEIGHT = 48;

export const TimeInput = forwardRef<HTMLDivElement, TimeInputProps>(
  ({ label, name, error, required, initialValue, onChange }, ref) => {
    const today = new Date();

    function parseInitial(value?: string) {
      if (!value) {
        return {
          hour: String(today.getHours()).padStart(2, "0"),
          minute: String(today.getMinutes()).padStart(2, "0"),
        };
      }

      const match = value.match(/^(\d{2}):(\d{2})$/);
      if (!match) {
        return {
          hour: String(today.getHours()).padStart(2, "0"),
          minute: String(today.getMinutes()).padStart(2, "0"),
        };
      }

      return {
        hour: match[1],
        minute: match[2],
      };
    }

    const [hour, setHour] = useState(() => parseInitial(initialValue).hour);
    const [minute, setMinute] = useState(() => parseInitial(initialValue).minute);
    const onChangeRef = useRef(onChange);
    const lastEmittedValueRef = useRef<string | null>(null);

    const formattedTime = `${hour}:${minute}`;

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      if (lastEmittedValueRef.current === formattedTime) {
        return;
      }

      lastEmittedValueRef.current = formattedTime;
      onChangeRef.current?.(formattedTime);
    }, [formattedTime]);

    return (
      <div 
        ref={ref}
        className="flex flex-col gap-4 bg-surface-container-low p-5 rounded-3xl border border-surface-variant/20 shadow-sm"
      >
        <div className="flex justify-between items-center px-1">
          <label className="font-data text-[13px] text-text-primary">
            {label} {required && "*"}
          </label>
          <span className="font-data text-[10px] tracking-widest text-text-secondary uppercase">
            Formato 24h
          </span>
        </div>
        
        <div 
          className="relative h-[144px] flex items-center justify-center gap-10"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
            maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)"
          }}
        >
          {/* Scroll Wheels e Colon */}
          <div className="relative w-16 h-full flex items-center justify-center">
            {/* Hour Highlight */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-12 bg-surface-container-highest/60 rounded-xl pointer-events-none" />
            <ScrollWheel options={HOURS} value={hour} onChange={setHour} widthClass="w-full z-10" />
          </div>
          
          <div className="text-xl font-data text-primary font-bold z-10 flex items-center justify-center h-12 leading-none">:</div>
          
          <div className="relative w-16 h-full flex items-center justify-center">
            {/* Minute Highlight */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-12 bg-surface-container-highest/60 rounded-xl pointer-events-none" />
            <ScrollWheel options={MINUTES} value={minute} onChange={setMinute} widthClass="w-full z-10" />
          </div>
        </div>

        <input type="hidden" name={name} value={formattedTime} id={name} />
        
        <p className="font-data text-[11px] text-text-disabled text-center mt-2 px-4 leading-relaxed tracking-wide">
          A hora exata nos ajuda a criar um<br />cronograma inicial mais preciso.
        </p>
        
        {error && (
          <span className="font-data text-xs text-error mt-1 text-center">
            {error}
          </span>
        )}
      </div>
    );
  }
);
TimeInput.displayName = "TimeInput";

function ScrollWheel({ options, value, onChange, widthClass }: { options: string[], value: string, onChange: (v: string) => void, widthClass: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const idx = options.indexOf(value);
    if (!isInteracting.current && idx !== -1 && containerRef.current) {
      containerRef.current.scrollTop = idx * ITEM_HEIGHT;
    }
  }, [options, value]);

  const finalizeScrollPosition = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const idx = Math.min(
      Math.max(Math.round(el.scrollTop / ITEM_HEIGHT), 0),
      options.length - 1
    );
    const nextValue = options[idx];

    el.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
    isInteracting.current = false;

    if (nextValue !== value) {
      onChange(nextValue);
    }
  }, [onChange, options, value]);

  const scheduleFinalize = useCallback(() => {
    if (settleTimeoutRef.current) {
      clearTimeout(settleTimeoutRef.current);
    }

    settleTimeoutRef.current = setTimeout(() => {
      finalizeScrollPosition();
      settleTimeoutRef.current = null;
    }, 120);
  }, [finalizeScrollPosition]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      e.stopPropagation();
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      isInteracting.current = true;

      const currentIndex = Math.min(
        Math.max(Math.round(container.scrollTop / ITEM_HEIGHT), 0),
        options.length - 1
      );
      const direction = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      const nextIndex = Math.min(
        Math.max(currentIndex + direction, 0),
        options.length - 1
      );
      const nextTop = nextIndex * ITEM_HEIGHT;

      container.scrollTop = nextTop;

      const nextValue = options[nextIndex];
      if (nextValue !== value) {
        onChange(nextValue);
      }

      scheduleFinalize();
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [options.length, scheduleFinalize]);

  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    isInteracting.current = true;

    const idx = Math.min(
      Math.max(Math.round(el.scrollTop / ITEM_HEIGHT), 0),
      options.length - 1
    );
    const newValue = options[idx];

    if (newValue !== value) {
      onChange(newValue);
    }

    scheduleFinalize();
  }, [onChange, options, scheduleFinalize, value]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onTouchStartCapture={() => {
        isInteracting.current = true;
      }}
      onTouchMoveCapture={() => {
        isInteracting.current = true;
      }}
      className={`h-full overflow-y-auto overscroll-contain snap-y snap-mandatory scrollbar-none touch-pan-y [&::-webkit-scrollbar]:hidden ${widthClass}`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div style={{ height: ITEM_HEIGHT }} />
      {options.map((opt) => (
        <div
          key={opt}
          className={`h-12 flex items-center justify-center snap-center font-data transition-colors duration-200 select-none ${
            opt === value ? "text-text-primary text-xl font-bold" : "text-text-disabled text-lg"
          }`}
        >
          {opt}
        </div>
      ))}
      <div style={{ height: ITEM_HEIGHT }} />
    </div>
  );
}
