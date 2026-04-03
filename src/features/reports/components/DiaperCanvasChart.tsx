"use client";

import { useMemo } from "react";
import type { DiaperBreakdown } from "../types";
import { DiaperBreakdownBarCanvas } from "./DiaperBreakdownBarCanvas";
import { createDiaperBarData } from "./report-chart.utils";

interface DiaperCanvasChartProps {
  breakdown: DiaperBreakdown;
}

export function DiaperCanvasChart({ breakdown }: DiaperCanvasChartProps) {
  const total = useMemo(
    () => breakdown.pee + breakdown.poop + breakdown.both,
    [breakdown],
  );
  const diaperTypes = useMemo(() => createDiaperBarData(breakdown), [breakdown]);

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-medium text-text-primary tracking-tight">
            Fraldas por Tipo
          </h3>
          <p className="font-data text-xs text-text-disabled mt-0.5">
            Breakdown do periodo
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
        {diaperTypes.map((type) => (
          <div key={type.key} className="flex items-center gap-3 min-w-0">
            <div className="w-16 flex-shrink-0">
              <span className="font-data text-[10px] uppercase tracking-wider text-text-disabled">
                {type.label}
              </span>
            </div>

            <DiaperBreakdownBarCanvas
              color={type.color}
              label={type.label}
              percent={type.percent}
              value={type.value}
            />

            <div className="w-12 text-right flex-shrink-0">
              <span className="font-data text-sm text-text-primary font-semibold tabular-nums">
                {type.value}
              </span>
              <span className="font-data text-[9px] text-text-disabled ml-1">
                ({type.percent}%)
              </span>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-center gap-4 pt-2 mt-2 border-t border-surface-variant/20">
          {diaperTypes.map((type) => (
            <div key={type.key} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: type.color }}
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
