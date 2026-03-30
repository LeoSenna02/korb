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
  const index = tx.store.index("byBabyIdAndCreated");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const all = await index.getAll(range);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getLatestGrowth(babyId: string): Promise<GrowthRecord | null> {
  const db = await getDB();
  const tx = db.transaction("growth");
  const index = tx.store.index("byBabyIdAndCreated");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const cursor = await index.openCursor(range, "prev");
  return cursor?.value ?? null;
}

export async function getRecentGrowthRecords(
  babyId: string,
  limit: number
): Promise<GrowthRecord[]> {
  const db = await getDB();
  const tx = db.transaction("growth");
  const index = tx.store.index("byBabyIdAndCreated");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const results: GrowthRecord[] = [];
  let cursor = await index.openCursor(range, "prev");
  while (cursor && results.length < limit) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}
