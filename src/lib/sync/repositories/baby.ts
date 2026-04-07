import type { Baby } from "@/lib/db/types";
import * as idb from "@/lib/db/repositories/baby";
import { syncEngine } from "../engine";
import { babyToRow } from "../mappers";

export async function saveBaby(
  data: Omit<Baby, "id" | "createdAt" | "updatedAt">
): Promise<Baby> {
  const record = await idb.saveBaby(data);
  syncEngine.syncRecord("babies", babyToRow(record), "upsert").catch(console.warn);
  return record;
}

export async function getBabyByUserId(userId: string): Promise<Baby | null> {
  return idb.getBabyByUserId(userId);
}

export async function getBabiesByUserId(userId: string): Promise<Baby[]> {
  return idb.getBabiesByUserId(userId);
}

export async function getBabyById(id: string): Promise<Baby | null> {
  return idb.getBabyById(id);
}

export async function updateBaby(
  id: string,
  data: Partial<Omit<Baby, "id" | "userId" | "createdAt">>
): Promise<Baby> {
  const record = await idb.updateBaby(id, data);
  syncEngine.syncRecord("babies", babyToRow(record), "upsert").catch(console.warn);
  return record;
}

export async function deleteBaby(id: string): Promise<void> {
  await idb.deleteBaby(id);
  syncEngine.syncRecord("babies", { id }, "delete").catch(console.warn);
}
