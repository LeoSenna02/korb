import type { GrowthChartDataPoint, GrowthReferencePoint } from "../types";
import { formatMonthShort, formatNumber } from "@/lib/utils/format";
export { hexToRgba } from "@/components/charts/canvas.utils";

export const GROWTH_CHART_HEIGHT = 180;
export const GROWTH_CHART_MIN_WIDTH = 280;

const CHART_PADDING = {
  top: 16,
  right: 16,
  bottom: 30,
  left: 42,
} as const;

export interface GrowthChartPoint extends GrowthChartDataPoint {
  x: number;
  y: number;
}

export interface GrowthChartTick {
  id: string;
  label: string;
  value: number;
  y: number;
}

export interface GrowthChartReferencePoint extends GrowthReferencePoint {
  lowerY: number;
  medianY: number;
  upperY: number;
  x: number;
}

export interface GrowthChartAxisLabel {
  id: string;
  label: string;
  x: number;
}

export interface GrowthChartModel {
  bounds: {
    bottom: number;
    chartHeight: number;
    chartWidth: number;
    left: number;
    right: number;
    top: number;
  };
  height: number;
  points: GrowthChartPoint[];
  referencePoints: GrowthChartReferencePoint[];
  width: number;
  xLabels: GrowthChartAxisLabel[];
  yTicks: GrowthChartTick[];
}

function getLabelIndexes(length: number, maxLabels: number) {
  if (length <= maxLabels) {
    return Array.from({ length }, (_, index) => index);
  }

  const indexes = new Set<number>();
  const lastIndex = length - 1;

  for (let slot = 0; slot < maxLabels; slot += 1) {
    const ratio = slot / (maxLabels - 1);
    indexes.add(Math.round(lastIndex * ratio));
  }

  return Array.from(indexes).sort((first, second) => first - second);
}

export function createGrowthChartModel(
  series: GrowthChartDataPoint[],
  width: number,
  referenceBand?: GrowthReferencePoint[] | null,
): GrowthChartModel {
  const safeWidth = Math.max(width, GROWTH_CHART_MIN_WIDTH);
  const chartWidth = safeWidth - CHART_PADDING.left - CHART_PADDING.right;
  const chartHeight =
    GROWTH_CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const normalizedReferenceBand =
    referenceBand?.length === series.length ? referenceBand : [];
  const rawValues = [
    ...series.map((point) => point.value),
    ...normalizedReferenceBand.flatMap((point) => [
      point.lower,
      point.median,
      point.upper,
    ]),
  ];
  const rawMin = Math.min(...rawValues);
  const rawMax = Math.max(...rawValues);
  const rawRange = rawMax - rawMin;
  const visualPadding = Math.max(rawRange * 0.1, rawMax * 0.02, 0.5);
  const yMin = rawMin - visualPadding;
  const yMax = rawMax + visualPadding;
  const yRange = yMax - yMin || 1;

  const toX = (index: number) =>
    series.length === 1
      ? CHART_PADDING.left + chartWidth / 2
      : CHART_PADDING.left + (index / (series.length - 1)) * chartWidth;
  const toY = (value: number) =>
    CHART_PADDING.top + chartHeight - ((value - yMin) / yRange) * chartHeight;

  const points = series.map((point, index) => ({
    ...point,
    x: toX(index),
    y: toY(point.value),
  }));

  const referencePoints = normalizedReferenceBand.map((point) => ({
    ...point,
    lowerY: toY(point.lower),
    medianY: toY(point.median),
    upperY: toY(point.upper),
    x: toX(point.seriesIndex),
  }));

  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, index) => {
    const ratio = index / tickCount;
    const value = yMax - ratio * yRange;
    const y = CHART_PADDING.top + ratio * chartHeight;

    return {
      id: `tick-${index}`,
      label: formatNumber(value),
      value,
      y,
    };
  });

  const xLabels = getLabelIndexes(series.length, 6).map((index) => ({
    id: `label-${index}`,
    label: formatMonthShort(series[index].date),
    x: points[index].x,
  }));

  return {
    bounds: {
      bottom: CHART_PADDING.top + chartHeight,
      chartHeight,
      chartWidth,
      left: CHART_PADDING.left,
      right: safeWidth - CHART_PADDING.right,
      top: CHART_PADDING.top,
    },
    height: GROWTH_CHART_HEIGHT,
    points,
    referencePoints,
    width: safeWidth,
    xLabels,
    yTicks,
  };
}
