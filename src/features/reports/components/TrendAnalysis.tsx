"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { TrendComparison, ReportSummary } from "../types";

interface TrendAnalysisProps {
  trends: TrendComparison[];
  summariesPrev: ReportSummary;
}

const metricColor: Record<string, string> = {
  feedings: "#8EAF96",
  sleep: "#B48EAD",
  diapers: "#D2B59D",
  weight: "#E3E2E6",
};

const metricIcon: Record<string, string> = {
  feedings: "x",
  sleep: "h",
  diapers: "x",
  weight: "g",
};

export function TrendAnalysis({ trends }: TrendAnalysisProps) {
  const maxCurrent = Math.max(...trends.map((t) => t.current));
  const maxPrev = Math.max(...trends.map((t) => t.previous));

  return (
    <div className="mb-8">
      <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-3">
        Comparativo com Período Anterior
      </h3>

      <div className="space-y-3">
        {trends.map((trend) => {
          const color = metricColor[trend.metric] || "#E3E2E6";
          const prevWidth = (trend.previous / maxPrev) * 100;
          const currWidth = (trend.current / maxCurrent) * 100;
          const isUpGood = trend.metric === "sleep" || trend.metric === "weight" || trend.metric === "feedings";

          return (
            <div
              key={trend.metric}
              className="p-4 bg-surface-container-low rounded-2xl border border-surface-variant/20"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-sm font-medium text-text-primary">
                  {trend.label}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-data text-xs font-semibold px-2 py-0.5 rounded-full
                      ${trend.direction === "up"
                        ? isUpGood ? "text-[#8EAF96] bg-[#8EAF96]/10" : "text-[#CD8282] bg-[#CD8282]/10"
                        : trend.direction === "down"
                        ? isUpGood ? "text-[#CD8282] bg-[#CD8282]/10" : "text-[#8EAF96] bg-[#8EAF96]/10"
                        : "text-text-disabled bg-surface-variant"
                      }
                    `}
                  >
                    {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}{" "}
                    {Math.abs(trend.changePercent).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Bars */}
              <div className="space-y-2">
                {/* Previous */}
                <div className="flex items-center gap-2">
                  <span className="font-data text-[9px] text-text-disabled w-12">Anterior</span>
                  <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full opacity-40 transition-all duration-500"
                      style={{
                        width: `${prevWidth}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span className="font-data text-[11px] text-text-disabled w-16 text-right tabular-nums">
                    {trend.previous} {trend.unit}
                  </span>
                </div>

                {/* Current */}
                <div className="flex items-center gap-2">
                  <span className="font-data text-[9px] text-text-disabled w-12">Atual</span>
                  <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${currWidth}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span className="font-data text-[11px] text-text-primary font-semibold w-16 text-right tabular-nums">
                    {trend.current} {trend.unit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
