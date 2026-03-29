import type { FeedingRecord, SleepRecord, DiaperRecord, GrowthRecord } from "../types";
import { getDB } from "../index";

export async function getReportFeedings(
  babyId: string,
  startDate: Date,
  endDate: Date
): Promise<FeedingRecord[]> {
  const db = await getDB();
  const tx = db.transaction("feedings");
  const index = tx.store.index("byBabyId");
  const all = await index.getAll(babyId);
  const start = startDate.getTime();
  const end = endDate.getTime();
  return all
    .filter((r) => {
      const t = new Date(r.startedAt).getTime();
      return t >= start && t <= end;
    })
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export async function getReportSleeps(
  babyId: string,
  startDate: Date,
  endDate: Date
): Promise<SleepRecord[]> {
  const db = await getDB();
  const tx = db.transaction("sleeps");
  const index = tx.store.index("byBabyId");
  const all = await index.getAll(babyId);
  const start = startDate.getTime();
  const end = endDate.getTime();
  return all
    .filter((r) => {
      const t = new Date(r.startedAt).getTime();
      return t >= start && t <= end;
    })
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export async function getReportDiapers(
  babyId: string,
  startDate: Date,
  endDate: Date
): Promise<DiaperRecord[]> {
  const db = await getDB();
  const tx = db.transaction("diapers");
  const index = tx.store.index("byBabyId");
  const all = await index.getAll(babyId);
  const start = startDate.getTime();
  const end = endDate.getTime();
  return all
    .filter((r) => {
      const t = new Date(r.changedAt).getTime();
      return t >= start && t <= end;
    })
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
}

export async function getReportGrowth(babyId: string): Promise<GrowthRecord[]> {
  const db = await getDB();
  const tx = db.transaction("growth");
  const index = tx.store.index("byBabyId");
  const all = await index.getAll(babyId);
  return all.sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  );
}
