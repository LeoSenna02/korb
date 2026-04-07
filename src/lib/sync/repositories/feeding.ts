import type { FeedingRecord } from "@/lib/db/types";
import * as idb from "@/lib/db/repositories/feeding";
import { syncEngine } from "../engine";
import { feedingToRow } from "../mappers";

export async function saveFeeding(
  data: Omit<FeedingRecord, "id" | "createdAt">
): Promise<FeedingRecord> {
  const record = await idb.saveFeeding(data);
  syncEngine.syncRecord("feedings", feedingToRow(record), "upsert").catch(console.warn);
  return record;
}

export async function getFeedingsByBabyId(babyId: string): Promise<FeedingRecord[]> {
  return idb.getFeedingsByBabyId(babyId);
}

export async function getRecentFeedings(babyId: string, limit: number): Promise<FeedingRecord[]> {
  return idb.getRecentFeedings(babyId, limit);
}
