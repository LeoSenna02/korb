import { getDB } from "../index";

export interface RecordCounts {
  totalFeedings: number;
  totalSleeps: number;
  totalDiapers: number;
  totalGrowth: number;
}

export async function getRecordCounts(babyId: string): Promise<RecordCounts> {
  const db = await getDB();

  const [txFeed, txSleep, txDiaper, txGrowth] = [
    db.transaction("feedings"),
    db.transaction("sleeps"),
    db.transaction("diapers"),
    db.transaction("growth"),
  ];

  const [totalFeedings, totalSleeps, totalDiapers, totalGrowth] = await Promise.all([
    txFeed.store.index("byBabyId").count(babyId),
    txSleep.store.index("byBabyId").count(babyId),
    txDiaper.store.index("byBabyId").count(babyId),
    txGrowth.store.index("byBabyId").count(babyId),
  ]);

  return { totalFeedings, totalSleeps, totalDiapers, totalGrowth };
}
