import type { MilestoneRecord } from "@/features/milestones/types";
import type { MilestoneCategory } from "@/features/milestones/constants";
import * as idb from "@/lib/db/repositories/milestone";
import { syncEngine } from "../engine";
import { milestoneToRow } from "../mappers";

export async function saveMilestone(
  milestone: Omit<MilestoneRecord, "createdAt" | "updatedAt">
): Promise<MilestoneRecord> {
  const record = await idb.saveMilestone(milestone);
  syncEngine.syncRecord("milestones", milestoneToRow(record), "upsert").catch(console.warn);
  return record;
}

export async function updateMilestone(
  id: string,
  updates: Partial<Omit<MilestoneRecord, "id" | "babyId" | "createdAt">>
): Promise<MilestoneRecord | null> {
  const record = await idb.updateMilestone(id, updates);
  if (record) {
    syncEngine.syncRecord("milestones", milestoneToRow(record), "upsert").catch(console.warn);
  }
  return record;
}

export async function getMilestonesByBabyId(babyId: string): Promise<MilestoneRecord[]> {
  return idb.getMilestonesByBabyId(babyId);
}

export async function getMilestonesByCategory(
  babyId: string,
  category: MilestoneCategory
): Promise<MilestoneRecord[]> {
  return idb.getMilestonesByCategory(babyId, category);
}

export async function getMilestoneById(id: string): Promise<MilestoneRecord | undefined> {
  return idb.getMilestoneById(id);
}

export async function deleteMilestone(id: string): Promise<void> {
  await idb.deleteMilestone(id);
  syncEngine.syncRecord("milestones", { id }, "delete").catch(console.warn);
}

export async function getMilestonesProgress(
  babyId: string,
  totalTemplates: number
): Promise<{ achieved: number; total: number; percentage: number }> {
  return idb.getMilestonesProgress(babyId, totalTemplates);
}
