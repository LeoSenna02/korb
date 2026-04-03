"use client";

import { useMemo } from "react";
import type { SleepPeriod } from "../types";
import { SleepTimelineRowCanvas } from "./SleepTimelineRowCanvas";

interface SleepCanvasChartProps {
  periods: SleepPeriod[];
}

export function SleepCanvasChart({ periods }: SleepCanvasChartProps) {
  const totalMinutes = useMemo(
    () => periods.reduce((sum, period) => sum + period.totalMinutes, 0),
    [periods],
  );

  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-medium text-text-primary tracking-tight">
            Ritmo de Sono
          </h3>
          <p className="font-data text-xs text-text-disabled mt-0.5">
            Distribuicao ao longo do dia
          </p>
        </div>
        <div className="text-right">
          <span className="font-display text-xl font-semibold text-[#B48EAD] tabular-nums">
            {totalHours}h {totalMins > 0 ? `${totalMins}m` : ""}
          </span>
          <span className="font-data text-[10px] text-text-disabled ml-1">total</span>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-2xl p-4">
        <div className="space-y-4">
          {periods.map((period) => (
            <div key={period.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-data text-[10px] uppercase tracking-wider text-text-disabled">
                  {period.label}
                </span>
                <span className="font-data text-xs text-[#B48EAD]">
                  {Math.floor(period.totalMinutes / 60)}h{" "}
                  {period.totalMinutes % 60 > 0 ? `${period.totalMinutes % 60}m` : ""}
                </span>
              </div>

              <SleepTimelineRowCanvas blocks={period.periods} label={period.label} />
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-3">
          <span className="font-data text-[9px] text-text-disabled">0h</span>
          <span className="font-data text-[9px] text-text-disabled">6h</span>
          <span className="font-data text-[9px] text-text-disabled">12h</span>
          <span className="font-data text-[9px] text-text-disabled">18h</span>
          <span className="font-data text-[9px] text-text-disabled">24h</span>
        </div>
      </div>
    </div>
  );
}
