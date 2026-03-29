"use client";

import { useMemo } from "react";
import type { DiaperBreakdown, ReportPeriod } from "../types";

interface DiaperChartProps {
  breakdown: DiaperBreakdown;
  period: ReportPeriod;
}

const diaperTypes = [
  {
    key: "pee" as const,
    label: "Xixi",
    color: "#D2B59D",
    bgColor: "bg-[#D2B59D]",
  },
  {
    key: "poop" as const,
    label: "Cocô",
    color: "#8EAF96",
    bgColor: "bg-[#8EAF96]",
  },
  {
    key: "both" as const,
    label: "Ambos",
    color: "#B48EAD",
    bgColor: "bg-[#B48EAD]",
  },
];

export function DiaperChart({ breakdown, period }: DiaperChartProps) {
  const total = useMemo(
    () => breakdown.pee + breakdown.poop + breakdown.both,
    [breakdown]
  );

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-medium text-text-primary tracking-tight">
            Fraldas por Tipo
          </h3>
          <p className="font-data text-xs text-text-disabled mt-0.5">
            Breakdown do período
          </p>
        </div>
        <div className="text-right">
          <span className="font-display text-xl font-semibold text-text-primary tabular-nums">
            {total}
          </span>
          <span className="font-data text-[10px] text-text-disabled ml-1">trocas</span>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-2xl p-4 space-y-3">
        {diaperTypes.map((type) => {
          const value = breakdown[type.key];
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;

          return (
            <div key={type.key} className="flex items-center gap-3">
              <div className="w-16 flex-shrink-0">
                <span className="font-data text-[10px] uppercase tracking-wider text-text-disabled">
                  {type.label}
                </span>
              </div>

              {/* Bar track */}
              <div className="flex-1 h-8 bg-surface-variant rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${type.bgColor}`}
                  style={{ width: `${pct}%` }}
                />
                {/* Percentage label inside */}
                {pct > 15 && (
                  <span className="absolute inset-0 flex items-center justify-center font-data text-[10px] text-surface-dim font-semibold">
                    {pct}%
                  </span>
                )}
              </div>

              {/* Count */}
              <div className="w-12 text-right flex-shrink-0">
                <span className="font-data text-sm text-text-primary font-semibold tabular-nums">
                  {value}
                </span>
                <span className="font-data text-[9px] text-text-disabled ml-1">
                  ({pct}%)
                </span>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-2 mt-2 border-t border-surface-variant/20">
          {diaperTypes.map((type) => (
            <div key={type.key} className="flex items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${type.bgColor}`}
              />
              <span className="font-data text-[9px] text-text-disabled uppercase tracking-wider">
                {type.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
