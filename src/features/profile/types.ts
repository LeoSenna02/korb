import type {
  Baby,
  DiaperRecord,
  FeedingRecord,
  GrowthRecord,
  PediatricAppointment,
  SleepRecord,
  SymptomEpisode,
} from "@/lib/db/types";
import type { MilestoneRecord } from "@/features/milestones/types";
import type { VaccineRecord } from "@/features/vaccines/types";

export type WeightUnit = "kg" | "lb";
export type VolumeUnit = "ml" | "oz";
export type Language = "pt-BR" | "en-US" | "es-ES";

export type ProfileSection = "summary" | "settings" | "data";

export interface BabyProfile {
  id: string;
  name: string;
  birthDate: string;
  gestationalWeeks: number;
  dueDate: string;
  gender: "male" | "female" | "other";
  photoUrl: string;
  bloodType: string;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  language: Language;
  weightUnit: WeightUnit;
  volumeUnit: VolumeUnit;
}

export interface DataStats {
  totalFeedings: number;
  totalSleeps: number;
  totalDiapers: number;
  totalGrowth: number;
  totalMilestones: number;
  totalVaccines: number;
  totalAppointments: number;
  totalSymptoms?: number;
  totalDays: number;
  lastBackup?: string;
}

export interface BackupBabyProfile {
  name: string;
  familyName: string;
  birthDate: string;
  birthTime?: string;
  gender: Baby["gender"];
  bloodType?: Baby["bloodType"];
  photoUrl?: string;
}

export interface BackupRecordCollection {
  feedings: FeedingRecord[];
  sleeps: SleepRecord[];
  diapers: DiaperRecord[];
  growth: GrowthRecord[];
  milestones: MilestoneRecord[];
  vaccines: VaccineRecord[];
  appointments: PediatricAppointment[];
  symptoms: SymptomEpisode[];
}

export interface BabyBackupPayload {
  schemaVersion: 1;
  exportedAt: string;
  baby: BackupBabyProfile;
  records: BackupRecordCollection;
  settings: AppSettings;
}

export interface ImportPreview {
  fileName: string;
  babyName: string;
  exportedAt: string;
  totalRecords: number;
  counts: {
    totalFeedings: number;
    totalSleeps: number;
    totalDiapers: number;
    totalGrowth: number;
    totalMilestones: number;
    totalVaccines: number;
    totalAppointments: number;
    totalSymptoms: number;
  };
}
