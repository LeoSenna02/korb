import type { FeedingRecord } from "../types";
import { getDB } from "../index";
import { generateId } from "../utils";

export async function saveFeeding(
  data: Omit<FeedingRecord, "id" | "createdAt">
): Promise<FeedingRecord> {
  const db = await getDB();
  const record: FeedingRecord = {
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  await db.put("feedings", record);
  return record;
}

export async function getFeedingsByBabyId(babyId: string): Promise<FeedingRecord[]> {
  const db = await getDB();
  const tx = db.transaction("feedings");
  const index = tx.store.index("byBabyId");
  const all = await index.getAll(babyId);
  return all.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getRecentFeedings(
  babyId: string,
  limit: number
): Promise<FeedingRecord[]> {
  const all = await getFeedingsByBabyId(babyId);
  return all.slice(0, limit);
}
