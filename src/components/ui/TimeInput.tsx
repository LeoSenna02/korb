"use client";

import { forwardRef, useState, useRef, useEffect, useCallback } from "react";

interface TimeInputProps {
  label: string;
  name?: string;
  error?: string;
  required?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const ITEM_HEIGHT = 48;

export const TimeInput = forwardRef<HTMLDivElement, TimeInputProps>(
  ({ label, name, error, required }, ref) => {
    const today = new Date();
    const [hour, setHour] = useState(String(today.getHours()).padStart(2, "0"));
    const [minute, setMinute] = useState(String(today.getMinutes()).padStart(2, "0"));

    const formattedTime = `${hour}:${minute}`;

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
  const isAnimating = useRef(false);

  useEffect(() => {
    const idx = options.indexOf(value);
    if (idx !== -1 && containerRef.current) {
      containerRef.current.scrollTop = idx * ITEM_HEIGHT;
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let debounce: ReturnType<typeof setTimeout> | null = null;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      if (debounce) return;
      debounce = setTimeout(() => { debounce = null; }, 200);

      const direction = e.deltaY > 0 ? 1 : -1;
      const currentIdx = Math.round(container.scrollTop / ITEM_HEIGHT);
      const target = Math.min(Math.max(currentIdx + direction, 0), options.length - 1);

      isAnimating.current = true;
      container.scrollTo({ top: target * ITEM_HEIGHT, behavior: "smooth" });

      onChange(options[target]);

      setTimeout(() => { isAnimating.current = false; }, 300);
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (debounce) clearTimeout(debounce);
    };
  }, [options, onChange]);

  const handleScroll = useCallback(() => {
    if (isAnimating.current) return;
    const el = containerRef.current;
    if (!el) return;

    const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
    const newValue = options[Math.min(Math.max(idx, 0), options.length - 1)];
    onChange(newValue);
  }, [options, onChange]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`h-full overflow-y-auto snap-y snap-mandatory scrollbar-none [&::-webkit-scrollbar]:hidden ${widthClass}`}
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
