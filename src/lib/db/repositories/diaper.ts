import type { DiaperRecord } from "../types";
import { getDB } from "../index";
import { generateId } from "../utils";

export async function saveDiaper(
  data: Omit<DiaperRecord, "id" | "createdAt">
): Promise<DiaperRecord> {
  const db = await getDB();
  const record: DiaperRecord = {
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  await db.put("diapers", record);
  return record;
}

export async function getDiapersByBabyId(babyId: string): Promise<DiaperRecord[]> {
  const db = await getDB();
  const tx = db.transaction("diapers");
  const index = tx.store.index("byBabyIdAndCreated");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const all = await index.getAll(range);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getRecentDiapers(
  babyId: string,
  limit: number
): Promise<DiaperRecord[]> {
  const db = await getDB();
  const tx = db.transaction("diapers");
  const index = tx.store.index("byBabyIdAndCreated");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const results: DiaperRecord[] = [];
  let cursor = await index.openCursor(range, "prev");
  while (cursor && results.length < limit) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}
