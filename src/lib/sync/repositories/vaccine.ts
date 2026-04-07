import type { VaccineRecord } from "@/features/vaccines/types";
import * as idb from "@/lib/db/repositories/vaccine";
import { syncEngine } from "../engine";
import { vaccineToRow } from "../mappers";

export async function saveVaccine(
  vaccine: Omit<VaccineRecord, "createdAt" | "updatedAt">
): Promise<VaccineRecord> {
  const record = await idb.saveVaccine(vaccine);
  syncEngine.syncRecord("vaccines", vaccineToRow(record), "upsert").catch(console.warn);
  return record;
}

export async function updateVaccine(
  id: string,
  updates: Partial<Omit<VaccineRecord, "id" | "babyId" | "createdAt">>
): Promise<VaccineRecord | null> {
  const record = await idb.updateVaccine(id, updates);
  if (record) {
    syncEngine.syncRecord("vaccines", vaccineToRow(record), "upsert").catch(console.warn);
  }
  return record;
}

export async function clearVaccineApplication(id: string): Promise<VaccineRecord | null> {
  const record = await idb.clearVaccineApplication(id);
  if (record) {
    syncEngine.syncRecord("vaccines", vaccineToRow(record), "upsert").catch(console.warn);
  }
  return record;
}

export async function getVaccinesByBabyId(babyId: string): Promise<VaccineRecord[]> {
  return idb.getVaccinesByBabyId(babyId);
}

export async function deleteVaccine(id: string): Promise<void> {
  await idb.deleteVaccine(id);
  syncEngine.syncRecord("vaccines", { id }, "delete").catch(console.warn);
}
