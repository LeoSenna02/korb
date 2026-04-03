"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SleepPeriodBlock } from "../types";
import {
  clamp,
  hexToRgba,
  setupHiDPICanvas,
} from "@/components/charts/canvas.utils";
import { useResponsiveCanvasSize } from "@/components/charts/useResponsiveCanvasSize";
import {
  createSleepSegments,
  REPORT_CHART_MIN_WIDTH,
  REPORT_TIMELINE_HEIGHT,
} from "./report-chart.utils";

interface SleepTimelineRowCanvasProps {
  blocks: SleepPeriodBlock[];
  label: string;
}

export function SleepTimelineRowCanvas({
  blocks,
  label,
}: SleepTimelineRowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { containerRef, width } = useResponsiveCanvasSize({
    minWidth: REPORT_CHART_MIN_WIDTH,
  });
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);

  const segments = useMemo(() => createSleepSegments(blocks, width), [blocks, width]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = setupHiDPICanvas(canvas, width, REPORT_TIMELINE_HEIGHT);

    if (!context) {
      return;
    }

    context.fillStyle = "rgba(74,75,83,0.2)";
    context.fillRect(0, 0, width, REPORT_TIMELINE_HEIGHT);

    segments.forEach((segment) => {
      const isActive = segment.id === activeSegmentId;
      context.fillStyle = isActive
        ? hexToRgba("#B48EAD", 1)
        : hexToRgba("#B48EAD", 0.82);
      context.fillRect(
        segment.left,
        0,
        Math.min(segment.width, width - segment.left),
        REPORT_TIMELINE_HEIGHT,
      );
    });
  }, [activeSegmentId, segments, width]);

  const activeSegment = segments.find((segment) => segment.id === activeSegmentId) ?? null;

  return (
    <div ref={containerRef} className="relative flex-1">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Linha do tempo de sono para ${label}`}
        className="block w-full rounded-full"
      />

      {activeSegment ? (
        <div
          className="pointer-events-none absolute rounded-xl border border-outline-variant/20 bg-[#1E1F26]/95 px-3 py-2 shadow-lg"
          style={{
            left: clamp(activeSegment.left + activeSegment.width / 2, 76, width - 76),
            top: -8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="font-data text-[9px] uppercase tracking-wider text-text-disabled">
            {label}
          </p>
          <p className="font-data text-[10px] text-text-primary">
            {Math.floor(activeSegment.durationMinutes / 60)}h{" "}
            {activeSegment.durationMinutes % 60 > 0
              ? `${activeSegment.durationMinutes % 60}m`
              : ""}
          </p>
        </div>
      ) : null}

      <div className="absolute inset-0">
        {segments.map((segment) => (
          <button
            key={segment.id}
            type="button"
            aria-label={`${label}, bloco de sono com ${segment.durationMinutes} minutos`}
            className="absolute h-full rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            style={{
              left: segment.left,
              width: Math.min(segment.width, width - segment.left),
              top: 0,
            }}
            onBlur={() => setActiveSegmentId(null)}
            onFocus={() => setActiveSegmentId(segment.id)}
            onMouseEnter={() => setActiveSegmentId(segment.id)}
            onMouseLeave={() => setActiveSegmentId(null)}
            onTouchStart={() => setActiveSegmentId(segment.id)}
          />
        ))}
      </div>
    </div>
  );
}
