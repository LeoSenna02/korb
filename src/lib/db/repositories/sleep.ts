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
  const index = tx.store.index("byBabyIdAndCreated");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const all = await index.getAll(range);
  return all.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function getTodaySleepRecords(babyId: string): Promise<SleepRecord[]> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  // Start of today in UTC (midnight local = some hour in UTC depending on timezone)
  const startOfTodayUtc = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  // End of today in UTC (23:59:59.999 local)
  const endOfTodayUtc = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  const db = await getDB();
  const tx = db.transaction("sleeps");
  const index = tx.store.index("byBabyIdAndStarted");
  const range = IDBKeyRange.bound(
    [babyId, startOfTodayUtc.toISOString()],
    [babyId, endOfTodayUtc.toISOString()]
  );
  const all = await index.getAll(range);
  return all.filter((r) => r.endedAt != null);
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
