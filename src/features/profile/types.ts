export type CaregiverRole =
  | "mãe"
  | "pai"
  | "avó"
  | "avô"
  | "tio"
  | "tia"
  | "babá"
  | "médico"
  | "outro";

export type WeightUnit = "kg" | "lb";
export type VolumeUnit = "ml" | "oz";
export type Language = "pt-BR" | "en-US" | "es-ES";

export type ProfileSection = "caregivers" | "settings" | "data";

export interface BabyProfile {
  id: string;
  name: string;
  birthDate: string; // ISO date string
  gestationalWeeks: number;
  dueDate: string; // ISO date string
  gender: "male" | "female" | "other";
  photoUrl: string;
  bloodType: string;
}

export interface Caregiver {
  id: string;
  name: string;
  role: CaregiverRole;
  avatarColor: string;
  phone?: string;
  isPrimary: boolean;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  language: Language;
  weightUnit: WeightUnit;
  volumeUnit: VolumeUnit;
}
