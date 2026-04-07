import type { SleepRecord } from "@/lib/db/types";
import * as idb from "@/lib/db/repositories/sleep";
import { syncEngine } from "../engine";
import { sleepToRow } from "../mappers";

export async function saveSleep(
  data: Omit<SleepRecord, "id" | "createdAt">
): Promise<SleepRecord> {
  const record = await idb.saveSleep(data);
  syncEngine.syncRecord("sleeps", sleepToRow(record), "upsert").catch(console.warn);
  return record;
}

export async function getSleepsByBabyId(babyId: string): Promise<SleepRecord[]> {
  return idb.getSleepsByBabyId(babyId);
}

export async function getTodaySleepRecords(babyId: string): Promise<SleepRecord[]> {
  return idb.getTodaySleepRecords(babyId);
}

export async function getTotalSleepSecondsToday(babyId: string): Promise<number> {
  return idb.getTotalSleepSecondsToday(babyId);
}
