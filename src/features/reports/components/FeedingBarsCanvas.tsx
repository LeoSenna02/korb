"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FeedingHourBucket } from "../types";
import {
  clamp,
  hexToRgba,
  setupHiDPICanvas,
} from "@/components/charts/canvas.utils";
import { useResponsiveCanvasSize } from "@/components/charts/useResponsiveCanvasSize";
import {
  createFeedingBarModel,
  REPORT_CHART_MIN_WIDTH,
  REPORT_FEEDING_CHART_HEIGHT,
} from "./report-chart.utils";

interface FeedingBarsCanvasProps {
  buckets: FeedingHourBucket[];
}

const HOUR_LABELS = [
  { label: "0h", ratio: 0 },
  { label: "6h", ratio: 6 / 24 },
  { label: "12h", ratio: 12 / 24 },
  { label: "18h", ratio: 18 / 24 },
  { label: "24h", ratio: 1 },
];

export function FeedingBarsCanvas({ buckets }: FeedingBarsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { containerRef, width } = useResponsiveCanvasSize({
    minWidth: REPORT_CHART_MIN_WIDTH,
  });
  const [activeHour, setActiveHour] = useState<number | null>(null);

  const chartModel = useMemo(
    () => createFeedingBarModel(buckets, width),
    [buckets, width],
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = setupHiDPICanvas(canvas, chartModel.width, chartModel.height);

    if (!context) {
      return;
    }

    for (let index = 0; index < 4; index += 1) {
      const y =
        chartModel.bounds.top +
        (index / 3) * (chartModel.bounds.barBottom - chartModel.bounds.top);
      context.beginPath();
      context.moveTo(chartModel.bounds.left, y);
      context.lineTo(chartModel.bounds.right, y);
      context.strokeStyle = "rgba(74,75,83,0.2)";
      context.setLineDash([3, 3]);
      context.lineWidth = 1;
      context.stroke();
    }

    context.setLineDash([]);

    chartModel.bars.forEach((bar) => {
      const isActive = activeHour === bar.hour;
      const gradient = context.createLinearGradient(
        0,
        bar.y,
        0,
        chartModel.bounds.barBottom,
      );
      gradient.addColorStop(0, hexToRgba("#8EAF96", isActive ? 0.95 : 0.8));
      gradient.addColorStop(1, hexToRgba("#8EAF96", isActive ? 0.55 : 0.35));
      context.fillStyle = gradient;
      context.fillRect(bar.left, bar.y, bar.width, bar.height);
    });
  }, [activeHour, chartModel]);

  const activeBar =
    chartModel.bars.find((bar) => bar.hour === activeHour) ?? null;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ minHeight: `${REPORT_FEEDING_CHART_HEIGHT}px` }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Grafico de distribuicao de mamadas por hora"
        className="block w-full h-auto"
      />

      <div className="pointer-events-none absolute inset-0">
        {HOUR_LABELS.map((label) => (
          <span
            key={label.label}
            className="absolute -translate-x-1/2 font-data text-[9px] text-text-disabled"
            style={{
              left: clamp(label.ratio * chartModel.width, 10, chartModel.width - 10),
              top: chartModel.height - 12,
            }}
          >
            {label.label}
          </span>
        ))}

        {activeBar ? (
          <div
            className="absolute rounded-xl border border-outline-variant/20 bg-[#1E1F26]/95 px-3 py-2 shadow-lg"
            style={{
              left: clamp(activeBar.x, 72, chartModel.width - 72),
              top: Math.max(activeBar.y - 10, 8),
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="font-data text-[9px] uppercase tracking-wider text-text-disabled">
              {String(activeBar.hour).padStart(2, "0")}:00
            </p>
            <p className="font-display text-sm font-semibold text-[#8EAF96]">
              {activeBar.count} mamada{activeBar.count === 1 ? "" : "s"}
            </p>
            <p className="font-data text-[10px] text-text-secondary">
              {activeBar.totalMl} ml
            </p>
          </div>
        ) : null}
      </div>

      <div className="absolute inset-0">
        {chartModel.bars.map((bar) => (
          <button
            key={bar.id}
            type="button"
            aria-label={`${String(bar.hour).padStart(2, "0")}:00, ${bar.count} mamadas e ${bar.totalMl} mililitros`}
            className="absolute rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            style={{
              left: bar.left,
              top: chartModel.bounds.top,
              width: bar.width,
              height: chartModel.bounds.barBottom - chartModel.bounds.top,
            }}
            onBlur={() => setActiveHour(null)}
            onFocus={() => setActiveHour(bar.hour)}
            onMouseEnter={() => setActiveHour(bar.hour)}
            onMouseLeave={() => setActiveHour(null)}
            onTouchStart={() => setActiveHour(bar.hour)}
          />
        ))}
      </div>
    </div>
  );
}
