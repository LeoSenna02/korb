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
  const index = tx.store.index("byBabyIdAndCreated");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const all = await index.getAll(range);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getRecentFeedings(
  babyId: string,
  limit: number
): Promise<FeedingRecord[]> {
  const db = await getDB();
  const tx = db.transaction("feedings");
  const index = tx.store.index("byBabyIdAndCreated");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const results: FeedingRecord[] = [];
  let cursor = await index.openCursor(range, "prev");
  while (cursor && results.length < limit) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}
