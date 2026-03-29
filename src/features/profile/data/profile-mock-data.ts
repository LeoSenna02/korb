import type { BabyProfile, Caregiver, AppSettings } from "../types";

export const MOCK_BABY: BabyProfile = {
  id: "b1",
  name: "Arthur",
  birthDate: "2026-01-01",
  gestationalWeeks: 40,
  dueDate: "2026-01-08",
  gender: "male",
  photoUrl: "/assets/baby-arthur.jpg",
  bloodType: "A+",
};

export const MOCK_CAREGIVERS: Caregiver[] = [
  {
    id: "c1",
    name: "Marina",
    role: "mãe",
    avatarColor: "#8EAF96",
    phone: "(11) 99999-0000",
    isPrimary: true,
  },
  {
    id: "c2",
    name: "Pedro",
    role: "pai",
    avatarColor: "#B48EAD",
    phone: "(11) 99999-1111",
    isPrimary: false,
  },
  {
    id: "c3",
    name: "Dr. Carlos",
    role: "médico",
    avatarColor: "#D2B59D",
    phone: "(11) 3333-4444",
    isPrimary: false,
  },
];

export const MOCK_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  soundEnabled: true,
  darkMode: true,
  language: "pt-BR",
  weightUnit: "kg",
  volumeUnit: "ml",
};

export const MOCK_DATA_STATS = {
  totalFeedings: 420,
  totalDays: 48,
  lastBackup: "23/03/2026",
};
