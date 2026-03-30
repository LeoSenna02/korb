import type { MilestoneCategory } from "./constants";

// Milestone record stored in IndexedDB
export interface MilestoneRecord {
  id: string;
  babyId: string;
  milestoneId: string; // ID from template or custom ID
  category: MilestoneCategory;
  name: string;
  description: string;
  expectedAgeMonthsMin: number;
  expectedAgeMonthsMax: number;
  actualDate?: string; // ISO date string when achieved
  notes?: string;
  isCustom: boolean; // true if created by user
  createdAt: string;
  updatedAt: string;
}

// Milestones grouped by category for display
export interface MilestonesByCategory {
  category: MilestoneCategory;
  templatesCount: number;
  achievedCount: number;
  milestones: MilestoneRecord[];
}
