import type { GrowthRecord } from "@/lib/db/types";
import * as idb from "@/lib/db/repositories/growth";
import { syncEngine } from "../engine";
import { growthToRow } from "../mappers";

export async function saveGrowth(
  data: Omit<GrowthRecord, "id" | "createdAt">
): Promise<GrowthRecord> {
  const record = await idb.saveGrowth(data);
  syncEngine.syncRecord("growth", growthToRow(record), "upsert").catch(console.warn);
  return record;
}

export async function getGrowthByBabyId(babyId: string): Promise<GrowthRecord[]> {
  return idb.getGrowthByBabyId(babyId);
}

export async function getGrowthById(id: string): Promise<GrowthRecord | null> {
  return idb.getGrowthById(id);
}

export async function getLatestGrowth(babyId: string): Promise<GrowthRecord | null> {
  return idb.getLatestGrowth(babyId);
}

export async function getRecentGrowthRecords(babyId: string, limit: number): Promise<GrowthRecord[]> {
  return idb.getRecentGrowthRecords(babyId, limit);
}

export async function updateGrowth(
  id: string,
  data: Partial<Omit<GrowthRecord, "id" | "babyId" | "createdAt">>
): Promise<GrowthRecord> {
  const record = await idb.updateGrowth(id, data);
  syncEngine.syncRecord("growth", growthToRow(record), "upsert").catch(console.warn);
  return record;
}

export async function deleteGrowth(id: string): Promise<void> {
  await idb.deleteGrowth(id);
  syncEngine.syncRecord("growth", { id }, "delete").catch(console.warn);
}
