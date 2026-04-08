import type {
  SymptomEpisode,
  SymptomSeverity,
} from "@/lib/db/types";

export interface SymptomOption {
  id: string;
  label: string;
}

export interface SymptomSeverityMeta {
  label: string;
  description: string;
  accentClassName: string;
  surfaceClassName: string;
}

export interface SymptomEpisodeFormValues {
  selectedSymptoms: string[];
  customSymptom: string;
  severity: SymptomSeverity;
  startDate: string;
  startTime: string;
  temperatureC: string;
  medication: string;
  notes: string;
}

export interface SymptomResolutionFormValues {
  resolvedDate: string;
  resolvedTime: string;
  resolutionNotes: string;
}

export interface SymptomsSummary {
  activeCount: number;
  resolvedCount: number;
  totalCount: number;
}

export interface SymptomsState {
  activeEpisodes: SymptomEpisode[];
  resolvedEpisodes: SymptomEpisode[];
  summary: SymptomsSummary;
}
