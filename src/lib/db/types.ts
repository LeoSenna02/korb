export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface Baby {
  id: string;
  userId: string;
  name: string;
  familyName: string;
  birthDate: string;
  birthTime?: string;
  gender: "girl" | "boy";
  bloodType?: BloodType;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type FeedingType = "left" | "right" | "bottle" | "both";

export interface FeedingRecord {
  id: string;
  babyId: string;
  type: FeedingType;
  durationSeconds?: number; // total combined for "both" type
  leftSeconds?: number;     // only for "both" type
  rightSeconds?: number;    // only for "both" type
  volumeMl?: number;
  notes?: string;
  startedAt: string;
  createdAt: string;
}

export type DiaperType = "xixi" | "coco" | "ambos";
export type DiaperConsistency = "liquido" | "pastoso" | "solido";
export type DiaperColor = "#8B4513" | "#DAA520" | "#556B2F";

export interface DiaperRecord {
  id: string;
  babyId: string;
  type: DiaperType;
  consistency: DiaperConsistency;
  color: DiaperColor;
  notes?: string;
  changedAt: string;
  createdAt: string;
}

export interface GrowthRecord {
  id: string;
  babyId: string;
  weightKg?: number;
  heightCm?: number;
  cephalicCm?: number;
  notes?: string;
  measuredAt: string;
  createdAt: string;
}

export type SleepType = "nap" | "night";

export interface SleepRecord {
  id: string;
  babyId: string;
  type: SleepType;
  startedAt: string;
  endedAt?: string;
  notes?: string;
  createdAt: string;
}

export type SymptomSeverity = "leve" | "moderada" | "alta";
export type SymptomEpisodeStatus = "active" | "resolved";

export interface SymptomEpisode {
  id: string;
  babyId: string;
  symptoms: string[];
  severity: SymptomSeverity;
  status: SymptomEpisodeStatus;
  startedAt: string;
  temperatureC?: number;
  medication?: string;
  notes?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PediatricAppointmentStatus = "scheduled" | "attended";

export interface PediatricAppointment {
  id: string;
  babyId: string;
  doctorName: string;
  location: string;
  reason: string;
  scheduledAt: string;
  status: PediatricAppointmentStatus;
  preVisitNotes?: string;
  postVisitNotes?: string;
  followUpIntervalDays?: number;
  followUpInstructions?: string;
  linkedGrowthId?: string;
  linkedVaccineIds: string[];
  attendedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityRecord =
  | (FeedingRecord & { activityType: "feeding" })
  | (DiaperRecord & { activityType: "diaper" })
  | (GrowthRecord & { activityType: "growth" })
  | (SleepRecord & { activityType: "sleep" })
  | (SymptomEpisode & { activityType: "symptom" })
  | (PediatricAppointment & { activityType: "appointment" });
