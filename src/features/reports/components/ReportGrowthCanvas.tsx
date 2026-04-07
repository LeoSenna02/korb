"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GrowthDataPoint } from "../types";
import { formatDateLong, formatNumber } from "@/lib/utils/format";
import {
  clamp,
  hexToRgba,
  setupHiDPICanvas,
} from "@/components/charts/canvas.utils";
import { useResponsiveCanvasSize } from "@/components/charts/useResponsiveCanvasSize";
import {
  createReportGrowthModel,
  REPORT_CHART_MIN_WIDTH,
  REPORT_GROWTH_CHART_HEIGHT,
} from "./report-chart.utils";
import { formatWeightGramsForReport } from "../utils/weight-format";

interface ReportGrowthCanvasProps {
  series: GrowthDataPoint[];
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

export function ReportGrowthCanvas({ series }: ReportGrowthCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { containerRef, width } = useResponsiveCanvasSize({
    minWidth: REPORT_CHART_MIN_WIDTH,
  });
  const [activeIndex, setActiveIndex] = useState(series.length - 1);

  useEffect(() => {
    setActiveIndex(series.length - 1);
  }, [series]);

  const chartModel = useMemo(
    () => createReportGrowthModel(series, width),
    [series, width],
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
      const y = chartModel.bounds.top + (index / 3) * chartModel.bounds.chartHeight;
      context.beginPath();
      context.moveTo(chartModel.bounds.left, y);
      context.lineTo(chartModel.bounds.right, y);
      context.strokeStyle = "rgba(74,75,83,0.3)";
      context.setLineDash([4, 4]);
      context.lineWidth = 1;
      context.stroke();
    }

    context.setLineDash([]);

    const gradient = context.createLinearGradient(
      0,
      chartModel.bounds.top,
      0,
      chartModel.bounds.bottom,
    );
    gradient.addColorStop(0, hexToRgba("#8EAF96", 0.3));
    gradient.addColorStop(1, hexToRgba("#8EAF96", 0));

    context.beginPath();
    drawLinePath(
      context,
      chartModel.points.map((point) => ({ x: point.x, y: point.yWeight })),
    );
    context.lineTo(
      chartModel.points[chartModel.points.length - 1].x,
      chartModel.bounds.bottom,
    );
    context.lineTo(chartModel.points[0].x, chartModel.bounds.bottom);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();

    context.beginPath();
    drawLinePath(
      context,
      chartModel.points.map((point) => ({ x: point.x, y: point.yWeight })),
    );
    context.strokeStyle = "#8EAF96";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();

    context.beginPath();
    drawLinePath(
      context,
      chartModel.points.map((point) => ({ x: point.x, y: point.yHeight })),
    );
    context.strokeStyle = "#B48EAD";
    context.setLineDash([6, 3]);
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
    context.setLineDash([]);

    chartModel.points.forEach((point, index) => {
      const isActive = index === activeIndex;

      context.beginPath();
      context.arc(point.x, point.yWeight, isActive ? 5 : 4, 0, Math.PI * 2);
      context.fillStyle = "#1E1F26";
      context.fill();
      context.strokeStyle = "#8EAF96";
      context.lineWidth = isActive ? 2.5 : 2;
      context.stroke();

      context.beginPath();
      context.arc(point.x, point.yHeight, isActive ? 4.5 : 4, 0, Math.PI * 2);
      context.fillStyle = "#1E1F26";
      context.fill();
      context.strokeStyle = "#B48EAD";
      context.lineWidth = isActive ? 2.5 : 2;
      context.stroke();
    });
  }, [activeIndex, chartModel]);

  const activePoint = chartModel.points[activeIndex] ?? chartModel.points.at(-1);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ minHeight: `${REPORT_GROWTH_CHART_HEIGHT}px` }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Grafico de crescimento com ${series.length} medicoes`}
        className="block w-full h-auto"
      />

      <div className="pointer-events-none absolute inset-0">
        {chartModel.xLabels.map((label) => (
          <span
            key={label.id}
            className="absolute -translate-x-1/2 font-data text-[9px] text-text-disabled"
            style={{ left: label.x, top: chartModel.height - 12 }}
          >
            {label.label}
          </span>
        ))}

        {activePoint ? (
          <div
            className="absolute rounded-xl border border-outline-variant/20 bg-[#1E1F26]/95 px-3 py-2 shadow-lg"
            style={{
              left: clamp(activePoint.x, 78, chartModel.width - 78),
              top: Math.max(Math.min(activePoint.yWeight, activePoint.yHeight) - 18, 8),
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="font-data text-[9px] uppercase tracking-wider text-text-disabled">
              {formatDateLong(activePoint.date)}
            </p>
            <div className="flex items-center gap-3">
              <span className="font-data text-[10px] text-[#8EAF96]">
                {formatWeightGramsForReport(activePoint.weightGrams)}
              </span>
              <span className="font-data text-[10px] text-[#B48EAD]">
                {formatNumber(activePoint.heightCm)}cm
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="absolute inset-0">
        {chartModel.points.map((point, index) => (
          <button
            key={`${point.date}-${point.weightGrams}-${point.heightCm}-${index}`}
            type="button"
            aria-label={`Crescimento em ${formatDateLong(point.date)}: ${formatWeightGramsForReport(point.weightGrams)} e ${formatNumber(point.heightCm)} centimetros`}
            className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            style={{
              left: point.x,
              top: (point.yWeight + point.yHeight) / 2,
            }}
            onBlur={() => setActiveIndex(series.length - 1)}
            onFocus={() => setActiveIndex(index)}
            onMouseEnter={() => setActiveIndex(index)}
            onTouchStart={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
