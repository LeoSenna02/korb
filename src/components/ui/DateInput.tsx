"use client";

import { forwardRef, useState, useRef, useEffect, useCallback } from "react";

interface DateInputProps {
  label: string;
  name?: string;
  error?: string;
  required?: boolean;
  initialValue?: string; // ISO date string (YYYY-MM-DD)
  onChange?: (isoDate: string) => void;
  maxDate?: string; // ISO date string (YYYY-MM-DD), defaults to today
}

const MONTHS = [
  "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
  "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const currentYear = new Date().getFullYear();
const getYears = (maxYear: number) =>
  Array.from({ length: maxYear - (currentYear - 5) + 1 }, (_, i) => String(currentYear - 5 + i));

const ITEM_HEIGHT = 48; // h-12

export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  ({ label, name, error, required, initialValue, onChange, maxDate }, ref) => {
    const today = new Date();
    const maxYear = maxDate
      ? parseInt(maxDate.split("-")[0], 10)
      : today.getFullYear();

    // Parse initialValue if provided (ISO date string YYYY-MM-DD)
    const parseInitial = (isoDate?: string) => {
      if (!isoDate) return { day: String(today.getDate()).padStart(2, "0"), month: MONTHS[today.getMonth()], year: String(today.getFullYear()) };
      const normalizedIsoDate = isoDate.match(/^(\d{4}-\d{2}-\d{2})/)
        ? isoDate.slice(0, 10)
        : isoDate;
      const match = normalizedIsoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return { day: String(today.getDate()).padStart(2, "0"), month: MONTHS[today.getMonth()], year: String(today.getFullYear()) };
      const [, y, m, d] = match;
      return { day: d, month: MONTHS[parseInt(m, 10) - 1], year: y };
    };

    const initial = parseInitial(initialValue);
    const [day, setDay] = useState(initial.day);
    const [month, setMonth] = useState(initial.month);
    const [year, setYear] = useState(initial.year);
    const onChangeRef = useRef(onChange);
    const lastEmittedValueRef = useRef<string | null>(null);

    const monthIndex = MONTHS.indexOf(month) + 1;
    const formattedDate = `${year}-${String(monthIndex).padStart(2, "0")}-${day}`;

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      if (lastEmittedValueRef.current === formattedDate) {
        return;
      }

      lastEmittedValueRef.current = formattedDate;
      onChangeRef.current?.(formattedDate);
    }, [formattedDate]);

    return (
      <div 
        ref={ref}
        className="flex flex-col gap-4 bg-surface-container-low p-5 rounded-3xl border border-surface-variant/20 shadow-sm"
      >
        <label className="font-data text-[13px] text-text-primary">
          {label} {required && "*"}
        </label>
        
        <div 
          className="flex justify-between items-center relative h-[144px]"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
            maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)"
          }}
        >
          {/* Active row background for Date */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between pointer-events-none h-14 items-center gap-2">
             <div className="w-[25%] h-full bg-surface-container-highest/60 rounded-xl"></div>
             <div className="w-[50%] h-full bg-surface-container-highest/60 rounded-xl"></div>
             <div className="w-[25%] h-full bg-surface-container-highest/60 rounded-xl"></div>
          </div>
          
          <ScrollWheel options={DAYS} value={day} onChange={setDay} widthClass="flex-1 z-10" />
          <ScrollWheel options={MONTHS} value={month} onChange={setMonth} widthClass="flex-[2] z-10" />
          <ScrollWheel options={getYears(maxYear)} value={year} onChange={setYear} widthClass="flex-1 z-10" />
        </div>

        <input type="hidden" name={name} value={formattedDate} id={name} />
        
        {error && (
          <span className="font-data text-xs text-error mt-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

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
            opt === value ? "text-text-primary text-base font-bold" : "text-text-disabled text-sm"
          }`}
        >
          {opt}
        </div>
      ))}
      <div style={{ height: ITEM_HEIGHT }} />
    </div>
  );
}
