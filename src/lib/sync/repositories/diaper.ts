import type { DiaperRecord } from "@/lib/db/types";
import * as idb from "@/lib/db/repositories/diaper";
import { syncEngine } from "../engine";
import { diaperToRow } from "../mappers";

export async function saveDiaper(
  data: Omit<DiaperRecord, "id" | "createdAt">
): Promise<DiaperRecord> {
  const record = await idb.saveDiaper(data);
  syncEngine.syncRecord("diapers", diaperToRow(record), "upsert").catch(console.warn);
  return record;
}

export async function getDiapersByBabyId(babyId: string): Promise<DiaperRecord[]> {
  return idb.getDiapersByBabyId(babyId);
}

export async function getRecentDiapers(babyId: string, limit: number): Promise<DiaperRecord[]> {
  return idb.getRecentDiapers(babyId, limit);
}
