import { getDB } from "../index";
import type { MilestoneRecord } from "@/features/milestones/types";
import type { MilestoneCategory } from "@/features/milestones/constants";

export async function saveMilestone(
  milestone: Omit<MilestoneRecord, "createdAt" | "updatedAt">
): Promise<MilestoneRecord> {
  const db = await getDB();
  const now = new Date().toISOString();

  const record: MilestoneRecord = {
    ...milestone,
    createdAt: now,
    updatedAt: now,
  };

  await db.put("milestones", record);
  return record;
}

export async function updateMilestone(
  id: string,
  updates: Partial<Omit<MilestoneRecord, "id" | "babyId" | "createdAt">>
): Promise<MilestoneRecord | null> {
  const db = await getDB();
  const existing = await db.get("milestones", id);

  if (!existing) return null;

  const updated: MilestoneRecord = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.put("milestones", updated);
  return updated;
}

export async function getMilestonesByBabyId(
  babyId: string
): Promise<MilestoneRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex("milestones", "byBabyId", babyId);
}

export async function getMilestonesByCategory(
  babyId: string,
  category: MilestoneCategory
): Promise<MilestoneRecord[]> {
  const db = await getDB();
  const tx = db.transaction("milestones");
  const index = tx.store.index("byBabyIdAndCategory");
  const range = IDBKeyRange.only([babyId, category]);
  return index.getAll(range);
}

export async function getMilestoneById(id: string): Promise<MilestoneRecord | undefined> {
  const db = await getDB();
  return db.get("milestones", id);
}

export async function deleteMilestone(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("milestones", id);
}

export async function getMilestonesProgress(
  babyId: string,
  totalTemplates: number
): Promise<{ achieved: number; total: number; percentage: number }> {
  const milestones = await getMilestonesByBabyId(babyId);
  const achieved = milestones.filter((m) => m.actualDate !== undefined).length;

  return {
    achieved,
    total: totalTemplates,
    percentage: totalTemplates > 0 ? Math.round((achieved / totalTemplates) * 100) : 0,
  };
}
