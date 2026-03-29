"use client";

import { useMemo } from "react";
import type { FeedingHourBucket, ReportPeriod } from "../types";

interface FeedingChartProps {
  buckets: FeedingHourBucket[];
  period: ReportPeriod;
}

function formatHour(h: number): string {
  if (h === 0) return "0h";
  if (h === 6) return "6h";
  if (h === 12) return "12h";
  if (h === 18) return "18h";
  if (h === 24) return "24h";
  return "";
}

export function FeedingChart({ buckets, period }: FeedingChartProps) {
  const maxCount = useMemo(
    () => Math.max(...buckets.map((b) => b.count), 1),
    [buckets]
  );

  const totalMl = useMemo(
    () => buckets.reduce((sum, b) => sum + b.totalMl, 0),
    [buckets]
  );

  // Only show hours with activity or key markers
  const visibleHours = useMemo(() => {
    return buckets.filter((b) => {
      if (b.hour === 0 || b.hour === 6 || b.hour === 12 || b.hour === 18 || b.hour === 23) return true;
      return b.count > 0;
    });
  }, [buckets]);

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-medium text-text-primary tracking-tight">
            Distribuição de Mamadas
          </h3>
          <p className="font-data text-xs text-text-disabled mt-0.5">
            Por hora do dia
          </p>
        </div>
        <div className="text-right">
          <span className="font-display text-xl font-semibold text-[#8EAF96] tabular-nums">
            {totalMl}
          </span>
          <span className="font-data text-[10px] text-text-disabled ml-1">ml total</span>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-2xl p-4">
        {/* Chart area */}
        <div className="flex items-end gap-1 h-32 mb-2">
          {visibleHours.map((bucket) => {
            const heightPct = (bucket.count / maxCount) * 100;
            return (
              <div
                key={bucket.hour}
                className="flex-1 flex flex-col items-center justify-end group cursor-pointer"
              >
                {bucket.count > 0 && (
                  <span className="font-data text-[9px] text-[#8EAF96] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bucket.count}
                  </span>
                )}
                <div
                  className="w-full rounded-t-sm transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(142,175,150,0.5)]"
                  style={{
                    height: `${Math.max(heightPct, bucket.count > 0 ? 8 : 0)}%`,
                    background:
                      heightPct > 0
                        ? "linear-gradient(to top, rgba(142,175,150,0.4), rgba(142,175,150,0.8))"
                        : "transparent",
                    minHeight: bucket.count > 0 ? "8px" : "2px",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Hour labels */}
        <div className="flex justify-between px-0.5">
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
