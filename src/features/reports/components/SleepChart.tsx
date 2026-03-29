"use client";

import { useMemo } from "react";
import type { SleepPeriod, ReportPeriod } from "../types";

interface SleepChartProps {
  periods: SleepPeriod[];
  period: ReportPeriod;
}

export function SleepChart({ periods }: SleepChartProps) {
  const totalMinutes = useMemo(
    () => periods.reduce((sum, p) => sum + p.totalMinutes, 0),
    [periods]
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
            Distribuição ao longo do dia
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
        {/* Timeline */}
        <div className="space-y-4">
          {periods.map((period) => {
            const pct = (period.totalMinutes / (24 * 60)) * 100;
            return (
              <div key={period.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-data text-[10px] uppercase tracking-wider text-text-disabled">
                    {period.label}
                  </span>
                  <span className="font-data text-xs text-[#B48EAD]">
                    {Math.floor(period.totalMinutes / 60)}h {period.totalMinutes % 60 > 0 ? `${period.totalMinutes % 60}m` : ""}
                  </span>
                </div>

                {/* Timeline bar */}
                <div className="relative h-3 bg-surface-variant rounded-full overflow-hidden">
                  {/* 24-hour scale: 5h-12h = manha, 12h-18h = tarde, 18h-5h = noite */}
                  {period.label === "Manhã" && (
                    <>
                      <div
                        className="absolute h-full bg-[#B48EAD]/40 rounded-l-full"
                        style={{ left: `${(5 / 24) * 100}%`, width: `${(7 / 24) * 100}%` }}
                      />
                      {/* blocks */}
                      <div
                        className="absolute h-full bg-[#B48EAD] rounded-sm"
                        style={{
                          left: `${(5.5 / 24) * 100}%`,
                          width: `${(1.5 / 24) * 100}%`,
                        }}
                      />
                      <div
                        className="absolute h-full bg-[#B48EAD] rounded-sm"
                        style={{
                          left: `${(9 / 24) * 100}%`,
                          width: `${(1.5 / 24) * 100}%`,
                        }}
                      />
                    </>
                  )}
                  {period.label === "Tarde" && (
                    <>
                      <div
                        className="absolute h-full bg-[#B48EAD]/40 rounded-l-full"
                        style={{ left: `${(12 / 24) * 100}%`, width: `${(6 / 24) * 100}%` }}
                      />
                      <div
                        className="absolute h-full bg-[#B48EAD] rounded-sm"
                        style={{
                          left: `${(12.5 / 24) * 100}%`,
                          width: `${(2 / 24) * 100}%`,
                        }}
                      />
                      <div
                        className="absolute h-full bg-[#B48EAD] rounded-sm"
                        style={{
                          left: `${(16 / 24) * 100}%`,
                          width: `${(0.5 / 24) * 100}%`,
                        }}
                      />
                    </>
                  )}
                  {period.label === "Noite" && (
                    <>
                      <div
                        className="absolute h-full bg-[#B48EAD]/40"
                        style={{ left: `${(18 / 24) * 100}%`, width: `${(11 / 24) * 100}%` }}
                      />
                      <div
                        className="absolute h-full bg-[#B48EAD] rounded-sm"
                        style={{
                          left: `${(18.5 / 24) * 100}%`,
                          width: `${(0.5 / 24) * 100}%`,
                        }}
                      />
                      <div
                        className="absolute h-full bg-[#B48EAD] rounded-sm"
                        style={{
                          left: `${(19.5 / 24) * 100}%`,
                          width: `${(5 / 24) * 100}%`,
                        }}
                      />
                      <div
                        className="absolute h-full bg-[#B48EAD] rounded-sm"
                        style={{
                          left: `${(3 / 24) * 100}%`,
                          width: `${(2 / 24) * 100}%`,
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hour scale */}
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
