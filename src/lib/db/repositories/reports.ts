import type { FeedingRecord, SleepRecord, DiaperRecord, GrowthRecord } from "../types";
import { getDB } from "../index";

export async function getReportFeedings(
  babyId: string,
  startDate: Date,
  endDate: Date
): Promise<FeedingRecord[]> {
  const db = await getDB();
  const tx = db.transaction("feedings");
  const index = tx.store.index("byBabyIdAndStarted");
  const range = IDBKeyRange.bound(
    [babyId, startDate.toISOString()],
    [babyId, endDate.toISOString()]
  );
  const results = await index.getAll(range);
  return results.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function getReportSleeps(
  babyId: string,
  startDate: Date,
  endDate: Date
): Promise<SleepRecord[]> {
  const db = await getDB();
  const tx = db.transaction("sleeps");
  const index = tx.store.index("byBabyIdAndStarted");
  const range = IDBKeyRange.bound(
    [babyId, startDate.toISOString()],
    [babyId, endDate.toISOString()]
  );
  const results = await index.getAll(range);
  return results.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function getReportDiapers(
  babyId: string,
  startDate: Date,
  endDate: Date
): Promise<DiaperRecord[]> {
  const db = await getDB();
  const tx = db.transaction("diapers");
  const index = tx.store.index("byBabyIdAndChanged");
  const range = IDBKeyRange.bound(
    [babyId, startDate.toISOString()],
    [babyId, endDate.toISOString()]
  );
  const results = await index.getAll(range);
  return results.sort((a, b) => b.changedAt.localeCompare(a.changedAt));
}

export async function getReportGrowth(babyId: string): Promise<GrowthRecord[]> {
  const db = await getDB();
  const tx = db.transaction("growth");
  const index = tx.store.index("byBabyIdAndMeasured");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const results = await index.getAll(range);
  return results.sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
}
