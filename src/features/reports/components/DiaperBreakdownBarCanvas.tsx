"use client";

import { useEffect, useRef, useState } from "react";
import {
  clamp,
  hexToRgba,
  setupHiDPICanvas,
} from "@/components/charts/canvas.utils";
import { useResponsiveCanvasSize } from "@/components/charts/useResponsiveCanvasSize";
import { REPORT_CHART_MIN_WIDTH, REPORT_TIMELINE_HEIGHT } from "./report-chart.utils";

interface DiaperBreakdownBarCanvasProps {
  color: string;
  label: string;
  percent: number;
  value: number;
}

export function DiaperBreakdownBarCanvas({
  color,
  label,
  percent,
  value,
}: DiaperBreakdownBarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { containerRef, width } = useResponsiveCanvasSize({
    minWidth: REPORT_CHART_MIN_WIDTH,
  });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = setupHiDPICanvas(canvas, width, REPORT_TIMELINE_HEIGHT * 2 + 4);

    if (!context) {
      return;
    }

    const height = REPORT_TIMELINE_HEIGHT * 2 + 4;
    context.fillStyle = "rgba(74,75,83,0.2)";
    context.fillRect(0, 0, width, height);

    const fillWidth = (percent / 100) * width;

    if (fillWidth <= 0) {
      return;
    }

    const gradient = context.createLinearGradient(0, 0, fillWidth, 0);
    gradient.addColorStop(0, hexToRgba(color, isActive ? 0.95 : 0.82));
    gradient.addColorStop(1, hexToRgba(color, isActive ? 0.78 : 0.6));
    context.fillStyle = gradient;
    context.fillRect(0, 0, fillWidth, height);
  }, [color, isActive, percent, width]);

  const fillWidth = (percent / 100) * width;

  return (
    <div ref={containerRef} className="relative flex-1">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Barra de ${label} com ${percent}%`}
        className="block h-8 w-full rounded-full"
      />

      {percent > 15 ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-data text-[10px] font-semibold text-surface-dim">
          {percent}%
        </span>
      ) : null}

      {isActive ? (
        <div
          className="pointer-events-none absolute rounded-xl border border-outline-variant/20 bg-[#1E1F26]/95 px-3 py-2 shadow-lg"
          style={{
            left: clamp(Math.max(fillWidth, 24), 76, width - 76),
            top: -8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="font-data text-[9px] uppercase tracking-wider text-text-disabled">
            {label}
          </p>
          <p className="font-display text-sm font-semibold text-text-primary">
            {value} ({percent}%)
          </p>
        </div>
      ) : null}

      <button
        type="button"
        aria-label={`${label}: ${value} trocas, ${percent}%`}
        className="absolute inset-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        onBlur={() => setIsActive(false)}
        onFocus={() => setIsActive(true)}
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
        onTouchStart={() => setIsActive(true)}
      />
    </div>
  );
}
