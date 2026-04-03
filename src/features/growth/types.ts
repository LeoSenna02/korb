export interface GrowthSummary {
  currentWeightKg: number | null;
  currentHeightCm: number | null;
  currentCephalicCm: number | null;
  weightGainKg: number | null;
  heightGainCm: number | null;
  cephalicGainCm: number | null;
  firstMeasureDate: string | null;
  lastMeasureDate: string | null;
  totalRecords: number;
}

export interface GrowthChartDataPoint {
  date: string;
  value: number;
}

export interface GrowthReferencePoint {
  ageInMonths: number;
  date: string;
  lower: number;
  median: number;
  seriesIndex: number;
  upper: number;
}

export type GrowthMetricStatus = "below" | "within" | "above";

export interface GrowthMetricReferenceState {
  band: GrowthReferencePoint[] | null;
  reason: string | null;
  status: GrowthMetricStatus | null;
}

export interface GrowthRecordDisplay {
  id: string;
  date: string;
  weightKg?: number;
  heightCm?: number;
  cephalicCm?: number;
  notes?: string;
}

export type GrowthMetric = "weight" | "height" | "cephalic";
