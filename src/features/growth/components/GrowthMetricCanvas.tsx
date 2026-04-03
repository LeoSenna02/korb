"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GrowthChartDataPoint } from "../types";
import { formatDateLong, formatNumber } from "@/lib/utils/format";
import { clamp, setupHiDPICanvas } from "@/components/charts/canvas.utils";
import { useResponsiveCanvasSize } from "@/components/charts/useResponsiveCanvasSize";
import {
  createGrowthChartModel,
  GROWTH_CHART_HEIGHT,
  GROWTH_CHART_MIN_WIDTH,
  type GrowthChartReferencePoint,
  hexToRgba,
} from "./growth-chart.utils";
import type { GrowthReferencePoint } from "../types";

interface GrowthMetricCanvasProps {
  color: string;
  referenceBand?: GrowthReferencePoint[] | null;
  series: GrowthChartDataPoint[];
  title: string;
  unit: string;
}

function drawLinePath(
  context: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
) {
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
      return;
    }

    context.lineTo(point.x, point.y);
  });
}

function drawReferenceBand(
  context: CanvasRenderingContext2D,
  points: GrowthChartReferencePoint[],
) {
  if (points.length === 0) {
    return;
  }

  if (points.length === 1) {
    const point = points[0];
    const barWidth = 10;
    const barHeight = Math.max(point.lowerY - point.upperY, 8);

    context.fillStyle = "rgba(240,242,245,0.12)";
    context.fillRect(point.x - barWidth / 2, point.upperY, barWidth, barHeight);

    context.strokeStyle = "rgba(240,242,245,0.34)";
    context.lineWidth = 1;
    context.setLineDash([3, 3]);
    context.beginPath();
    context.moveTo(point.x - 8, point.medianY);
    context.lineTo(point.x + 8, point.medianY);
    context.stroke();
    context.setLineDash([]);
    return;
  }

  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.upperY);
      return;
    }

    context.lineTo(point.x, point.upperY);
  });

  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index];
    context.lineTo(point.x, point.lowerY);
  }

  context.closePath();
  context.fillStyle = "rgba(240,242,245,0.12)";
  context.fill();

  context.strokeStyle = "rgba(240,242,245,0.2)";
  context.lineWidth = 1;
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.upperY);
      return;
    }

    context.lineTo(point.x, point.upperY);
  });
  context.stroke();

  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.lowerY);
      return;
    }

    context.lineTo(point.x, point.lowerY);
  });
  context.stroke();

  context.setLineDash([4, 4]);
  context.strokeStyle = "rgba(240,242,245,0.34)";
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.medianY);
      return;
    }

    context.lineTo(point.x, point.medianY);
  });
  context.stroke();
  context.setLineDash([]);
}

export function GrowthMetricCanvas({
  color,
  referenceBand = null,
  series,
  title,
  unit,
}: GrowthMetricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { containerRef, width } = useResponsiveCanvasSize({
    minWidth: GROWTH_CHART_MIN_WIDTH,
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartModel = useMemo(
    () => createGrowthChartModel(series, width, referenceBand),
    [referenceBand, series, width],
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

    chartModel.yTicks.forEach((tick) => {
      context.beginPath();
      context.moveTo(chartModel.bounds.left, tick.y);
      context.lineTo(chartModel.bounds.right, tick.y);
      context.strokeStyle = "rgba(74,75,83,0.2)";
      context.setLineDash([3, 3]);
      context.lineWidth = 1;
      context.stroke();
    });

    context.setLineDash([]);

    drawReferenceBand(context, chartModel.referencePoints);

    if (chartModel.points.length > 1) {
      const gradient = context.createLinearGradient(
        0,
        chartModel.bounds.top,
        0,
        chartModel.bounds.bottom,
      );
      gradient.addColorStop(0, hexToRgba(color, 0.35));
      gradient.addColorStop(1, hexToRgba(color, 0));

      context.beginPath();
      drawLinePath(context, chartModel.points);
      context.lineTo(
        chartModel.points[chartModel.points.length - 1].x,
        chartModel.bounds.bottom,
      );
      context.lineTo(chartModel.points[0].x, chartModel.bounds.bottom);
      context.closePath();
      context.fillStyle = gradient;
      context.fill();

      context.beginPath();
      drawLinePath(context, chartModel.points);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
    }

    chartModel.points.forEach((point, index) => {
      const isActive = index === activeIndex;

      context.beginPath();
      context.arc(point.x, point.y, isActive ? 4.5 : 4, 0, Math.PI * 2);
      context.fillStyle = "#1E1F26";
      context.fill();

      context.beginPath();
      context.arc(point.x, point.y, isActive ? 4.5 : 4, 0, Math.PI * 2);
      context.strokeStyle = color;
      context.lineWidth = isActive ? 2.5 : 2;
      context.stroke();
    });
  }, [activeIndex, chartModel, color]);

  const activePoint =
    activeIndex != null ? chartModel.points[activeIndex] ?? null : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ minHeight: `${GROWTH_CHART_HEIGHT}px` }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Grafico de ${title.toLowerCase()} com ${series.length} medicoes`}
        className="block w-full h-auto"
      />

      <div className="pointer-events-none absolute inset-0">
        {chartModel.yTicks.map((tick) => (
          <span
            key={tick.id}
            className="absolute -translate-y-1/2 font-data text-[8px] text-text-disabled"
            style={{ left: 0, top: tick.y }}
          >
            {tick.label}
          </span>
        ))}

        {chartModel.xLabels.map((label) => (
          <span
            key={label.id}
            className="absolute -translate-x-1/2 font-data text-[8px] text-text-disabled"
            style={{ left: label.x, top: chartModel.height - 14 }}
          >
            {label.label}
          </span>
        ))}

        {activePoint ? (
          <div
            className="absolute rounded-xl border border-outline-variant/20 bg-[#1E1F26]/95 px-3 py-2 shadow-lg"
            style={{
              left: clamp(activePoint.x, 72, chartModel.width - 72),
              top: Math.max(activePoint.y - 54, 8),
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="font-data text-[9px] uppercase tracking-wider text-text-disabled">
              {formatDateLong(activePoint.date)}
            </p>
            <p className="font-display text-sm font-semibold text-text-primary">
              {formatNumber(activePoint.value)} {unit}
            </p>
          </div>
        ) : null}
      </div>

      <div className="absolute inset-0">
        {chartModel.points.map((point, index) => (
          <button
            key={`${point.date}-${point.value}`}
            type="button"
            aria-label={`${title} em ${formatDateLong(point.date)}: ${formatNumber(point.value)} ${unit}`}
            className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            style={{ left: point.x, top: point.y }}
            onBlur={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(index)}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onTouchStart={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
