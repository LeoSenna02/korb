"use client";

import { forwardRef, useState, useRef, useEffect, UIEvent } from "react";

interface DateInputProps {
  label: string;
  name?: string;
  error?: string;
  required?: boolean;
}

const MONTHS = [
  "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
  "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => String(currentYear - 5 + i)); // -5 to +9

const ITEM_HEIGHT = 48; // h-12

export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  ({ label, name, error, required }, ref) => {
    const today = new Date();
    const [day, setDay] = useState(String(today.getDate()).padStart(2, "0"));
    const [month, setMonth] = useState(MONTHS[today.getMonth()]);
    const [year, setYear] = useState(String(today.getFullYear()));

    const monthIndex = MONTHS.indexOf(month) + 1;
    const formattedDate = `${year}-${String(monthIndex).padStart(2, "0")}-${day}`;

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
          <ScrollWheel options={YEARS} value={year} onChange={setYear} widthClass="flex-1 z-10" />
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
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const idx = options.indexOf(value);
    if (idx !== -1 && containerRef.current) {
      containerRef.current.scrollTop = idx * ITEM_HEIGHT;
    }
  }, []);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    const idx = Math.round(y / ITEM_HEIGHT);
    const newValue = options[Math.min(Math.max(idx, 0), options.length - 1)];

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      onChange(newValue);
    }, 100);
  };

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
