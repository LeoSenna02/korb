import type {
  DiaperBreakdown,
  FeedingHourBucket,
  GrowthDataPoint,
  SleepPeriodBlock,
} from "../types";
import { formatMonthShort } from "@/lib/utils/format";

export const REPORT_CHART_MIN_WIDTH = 280;
export const REPORT_GROWTH_CHART_HEIGHT = 160;
export const REPORT_FEEDING_CHART_HEIGHT = 152;
export const REPORT_TIMELINE_HEIGHT = 14;

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

export interface ReportGrowthPoint extends GrowthDataPoint {
  x: number;
  yHeight: number;
  yWeight: number;
}

export interface ReportGrowthModel {
  bounds: {
    bottom: number;
    chartHeight: number;
    left: number;
    right: number;
    top: number;
  };
  height: number;
  points: ReportGrowthPoint[];
  width: number;
  xLabels: Array<{ id: string; label: string; x: number }>;
}

export function createReportGrowthModel(
  series: GrowthDataPoint[],
  width: number,
): ReportGrowthModel {
  const safeWidth = Math.max(width, REPORT_CHART_MIN_WIDTH);
  const padding = { top: 16, right: 16, bottom: 24, left: 16 } as const;
  const chartWidth = safeWidth - padding.left - padding.right;
  const chartHeight = REPORT_GROWTH_CHART_HEIGHT - padding.top - padding.bottom;

  const minWeight = Math.min(...series.map((point) => point.weightGrams)) - 200;
  const maxWeight = Math.max(...series.map((point) => point.weightGrams)) + 200;
  const minHeight = Math.min(...series.map((point) => point.heightCm)) - 2;
  const maxHeight = Math.max(...series.map((point) => point.heightCm)) + 2;

  const toX = (index: number) =>
    padding.left + (index / (series.length - 1)) * chartWidth;
  const toYWeight = (value: number) =>
    padding.top +
    chartHeight -
    ((value - minWeight) / Math.max(maxWeight - minWeight, 1)) * chartHeight;
  const toYHeight = (value: number) =>
    padding.top +
    chartHeight -
    ((value - minHeight) / Math.max(maxHeight - minHeight, 1)) * chartHeight;

  const points = series.map((point, index) => ({
    ...point,
    x: toX(index),
    yHeight: toYHeight(point.heightCm),
    yWeight: toYWeight(point.weightGrams),
  }));

  const xLabels = getLabelIndexes(series.length, 6).map((index) => ({
    id: `label-${index}`,
    label: formatMonthShort(series[index].date),
    x: points[index].x,
  }));

  return {
    bounds: {
      bottom: padding.top + chartHeight,
      chartHeight,
      left: padding.left,
      right: safeWidth - padding.right,
      top: padding.top,
    },
    height: REPORT_GROWTH_CHART_HEIGHT,
    points,
    width: safeWidth,
    xLabels,
  };
}

export interface FeedingBarModel {
  bars: Array<{
    count: number;
    hour: number;
    id: string;
    left: number;
    totalMl: number;
    width: number;
    x: number;
    y: number;
    height: number;
  }>;
  bounds: {
    barBottom: number;
    left: number;
    right: number;
    top: number;
  };
  height: number;
  width: number;
}

export function createFeedingBarModel(
  buckets: FeedingHourBucket[],
  width: number,
): FeedingBarModel {
  const safeWidth = Math.max(width, REPORT_CHART_MIN_WIDTH);
  const padding = { top: 12, right: 10, bottom: 24, left: 10 } as const;
  const chartWidth = safeWidth - padding.left - padding.right;
  const chartHeight = REPORT_FEEDING_CHART_HEIGHT - padding.top - padding.bottom;
  const barSlotWidth = chartWidth / buckets.length;
  const barWidth = Math.max(barSlotWidth * 0.68, 6);
  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);

  return {
    bars: buckets.map((bucket, index) => {
      const normalized = bucket.count / maxCount;
      const height = bucket.count > 0 ? Math.max(chartHeight * normalized, 8) : 2;
      const left = padding.left + index * barSlotWidth + (barSlotWidth - barWidth) / 2;
      const y = padding.top + chartHeight - height;

      return {
        count: bucket.count,
        height,
        hour: bucket.hour,
        id: `bar-${bucket.hour}`,
        left,
        totalMl: bucket.totalMl,
        width: barWidth,
        x: left + barWidth / 2,
        y,
      };
    }),
    bounds: {
      barBottom: padding.top + chartHeight,
      left: padding.left,
      right: safeWidth - padding.right,
      top: padding.top,
    },
    height: REPORT_FEEDING_CHART_HEIGHT,
    width: safeWidth,
  };
}

export interface SleepSegment {
  durationMinutes: number;
  id: string;
  left: number;
  width: number;
}

function parseHourMinute(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function createSleepSegments(
  blocks: SleepPeriodBlock[],
  width: number,
): SleepSegment[] {
  const safeWidth = Math.max(width, REPORT_CHART_MIN_WIDTH);
  const minutesToX = (minutes: number) => (minutes / (24 * 60)) * safeWidth;

  return blocks.flatMap((block, index) => {
    const startMinutes = parseHourMinute(block.start);
    const endMinutes = parseHourMinute(block.end);

    if (endMinutes >= startMinutes) {
      return [
        {
          durationMinutes: block.durationMinutes,
          id: `${block.start}-${block.end}-${index}`,
          left: minutesToX(startMinutes),
          width: Math.max(minutesToX(endMinutes) - minutesToX(startMinutes), 4),
        },
      ];
    }

    return [
      {
        durationMinutes: block.durationMinutes,
        id: `${block.start}-24-${index}`,
        left: minutesToX(startMinutes),
        width: Math.max(minutesToX(24 * 60) - minutesToX(startMinutes), 4),
      },
      {
        durationMinutes: block.durationMinutes,
        id: `0-${block.end}-${index}`,
        left: 0,
        width: Math.max(minutesToX(endMinutes), 4),
      },
    ];
  });
}

export function createDiaperBarData(
  breakdown: DiaperBreakdown,
): Array<{
  color: string;
  key: keyof DiaperBreakdown;
  label: string;
  percent: number;
  value: number;
}> {
  const total = breakdown.pee + breakdown.poop + breakdown.both;
  const baseData = [
    { color: "#D2B59D", key: "pee" as const, label: "Xixi", value: breakdown.pee },
    { color: "#8EAF96", key: "poop" as const, label: "Coco", value: breakdown.poop },
    { color: "#B48EAD", key: "both" as const, label: "Ambos", value: breakdown.both },
  ];

  return baseData.map((item) => ({
    ...item,
    percent: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }));
}
