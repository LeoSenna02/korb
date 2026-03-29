"use client";

import type { ReportPeriod } from "../types";

const PERIODS: { label: string; value: ReportPeriod }[] = [
  { label: "Dia", value: "day" },
  { label: "Semana", value: "week" },
  { label: "Mês", value: "month" },
  { label: "Tudo", value: "all" },
];

interface ReportsPeriodSelectorProps {
  active: ReportPeriod;
  onChange: (p: ReportPeriod) => void;
}

export function ReportsPeriodSelector({
  active,
  onChange,
}: ReportsPeriodSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pt-2 pb-6 -mx-6 px-6 scrollbar-none">
      {PERIODS.map((p) => {
        const isActive = active === p.value;
        return (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`
              flex-shrink-0 px-5 py-2.5 rounded-full font-display text-sm font-medium
              transition-all duration-300 transform active:scale-95 whitespace-nowrap
              ${
                isActive
                  ? "bg-primary text-on-primary glow-primary"
                  : "bg-surface-container-low border border-surface-variant/20 text-text-secondary hover:bg-surface-variant/40 hover:text-text-primary"
              }
            `}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
