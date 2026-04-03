export interface VaccineRecord {
  id: string;
  babyId: string;
  vaccineId: string;
  name: string;
  doseLabel?: string;
  scheduledMonth: number;
  appliedDate?: string;
  appliedLocation?: string;
  notes?: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VaccineStatus = "taken" | "pending" | "locked";
export type VaccineSheetMode =
  | "official-record"
  | "custom-create"
  | "custom-edit";

export interface VaccineTimelineItem {
  id: string;
  vaccineId: string;
  name: string;
  doseLabel?: string;
  scheduledMonth: number;
  appliedDate?: string;
  appliedLocation?: string;
  notes?: string;
  isCustom: boolean;
  status: VaccineStatus;
  sortOrder: number;
  recordId?: string;
  createdAt?: string;
}

export interface VaccineMonthSummary {
  total: number;
  taken: number;
  pending: number;
  locked: number;
}

export interface VaccineMonthGroup {
  month: number;
  label: string;
  summary: VaccineMonthSummary;
  items: VaccineTimelineItem[];
}
