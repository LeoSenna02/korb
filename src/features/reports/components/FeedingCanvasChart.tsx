"use client";

import { useMemo } from "react";
import type { FeedingHourBucket } from "../types";
import { FeedingBarsCanvas } from "./FeedingBarsCanvas";

interface FeedingCanvasChartProps {
  buckets: FeedingHourBucket[];
}

export function FeedingCanvasChart({ buckets }: FeedingCanvasChartProps) {
  const totalMl = useMemo(
    () => buckets.reduce((sum, bucket) => sum + bucket.totalMl, 0),
    [buckets],
  );

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-medium text-text-primary tracking-tight">
            Distribuicao de Mamadas
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
        <FeedingBarsCanvas buckets={buckets} />
      </div>
    </div>
  );
}
