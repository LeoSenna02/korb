import { getDB } from "../index";
import type { VaccineRecord } from "@/features/vaccines/types";

export async function saveVaccine(
  vaccine: Omit<VaccineRecord, "createdAt" | "updatedAt">
): Promise<VaccineRecord> {
  const db = await getDB();
  const now = new Date().toISOString();

  const record: VaccineRecord = {
    ...vaccine,
    createdAt: now,
    updatedAt: now,
  };

  await db.put("vaccines", record);
  return record;
}

export async function updateVaccine(
  id: string,
  updates: Partial<Omit<VaccineRecord, "id" | "babyId" | "createdAt">>
): Promise<VaccineRecord | null> {
  const db = await getDB();
  const existing = await db.get("vaccines", id);

  if (!existing) return null;

  const updated: VaccineRecord = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.put("vaccines", updated);
  return updated;
}

export async function clearVaccineApplication(
  id: string
): Promise<VaccineRecord | null> {
  return updateVaccine(id, {
    appliedDate: undefined,
    appliedLocation: undefined,
    notes: undefined,
  });
}

export async function getVaccinesByBabyId(
  babyId: string
): Promise<VaccineRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex("vaccines", "byBabyId", babyId);
}

export async function deleteVaccine(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("vaccines", id);
}
