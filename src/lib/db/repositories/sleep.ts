import type { SleepRecord } from "../types";
import { getDB } from "../index";
import { generateId } from "../utils";

export async function saveSleep(
  data: Omit<SleepRecord, "id" | "createdAt">
): Promise<SleepRecord> {
  const db = await getDB();
  const record: SleepRecord = {
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  await db.put("sleeps", record);
  return record;
}

export async function getSleepsByBabyId(babyId: string): Promise<SleepRecord[]> {
  const db = await getDB();
  const tx = db.transaction("sleeps");
  const index = tx.store.index("byBabyId");
  const all = await index.getAll(babyId);
  return all.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

export async function getTodaySleepRecords(babyId: string): Promise<SleepRecord[]> {
  const all = await getSleepsByBabyId(babyId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return all.filter((r) => new Date(r.startedAt) >= today && r.endedAt != null);
}

export async function getTotalSleepSecondsToday(babyId: string): Promise<number> {
  const records = await getTodaySleepRecords(babyId);
  return records.reduce((total, r) => {
    if (!r.endedAt) return total;
    const start = new Date(r.startedAt).getTime();
    const end = new Date(r.endedAt).getTime();
    return total + Math.floor((end - start) / 1000);
  }, 0);
}
