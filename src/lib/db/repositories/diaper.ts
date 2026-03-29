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
  const index = tx.store.index("byBabyId");
  const all = await index.getAll(babyId);
  return all.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getRecentDiapers(
  babyId: string,
  limit: number
): Promise<DiaperRecord[]> {
  const all = await getDiapersByBabyId(babyId);
  return all.slice(0, limit);
}
