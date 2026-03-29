import type { GrowthRecord } from "../types";
import { getDB } from "../index";
import { generateId } from "../utils";

export async function saveGrowth(
  data: Omit<GrowthRecord, "id" | "createdAt">
): Promise<GrowthRecord> {
  const db = await getDB();
  const record: GrowthRecord = {
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  await db.put("growth", record);
  return record;
}

export async function getGrowthByBabyId(babyId: string): Promise<GrowthRecord[]> {
  const db = await getDB();
  const tx = db.transaction("growth");
  const index = tx.store.index("byBabyId");
  const all = await index.getAll(babyId);
  return all.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getLatestGrowth(babyId: string): Promise<GrowthRecord | null> {
  const all = await getGrowthByBabyId(babyId);
  return all[0] ?? null;
}
