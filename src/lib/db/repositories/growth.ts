import type { GrowthRecord } from "../types";
import { z } from "zod";
import { getDB } from "../index";
import { generateId } from "../utils";

const growthRecordSchema = z
  .object({
    babyId: z.string().min(1),
    weightKg: z.number().positive().max(30).optional(),
    heightCm: z.number().positive().max(130).optional(),
    cephalicCm: z.number().positive().max(80).optional(),
    notes: z.string().trim().max(1000).optional(),
    measuredAt: z.string().min(1),
  })
  .refine(
    (values) =>
      values.weightKg != null ||
      values.heightCm != null ||
      values.cephalicCm != null,
    {
      message: "At least one growth measurement is required",
      path: ["weightKg"],
    }
  );

export async function saveGrowth(
  data: Omit<GrowthRecord, "id" | "createdAt">
): Promise<GrowthRecord> {
  const db = await getDB();
  const parsedData = growthRecordSchema.parse(data);
  const record: GrowthRecord = {
    id: generateId(),
    ...parsedData,
    createdAt: new Date().toISOString(),
  };
  await db.put("growth", record);
  return record;
}

export async function getGrowthById(id: string): Promise<GrowthRecord | null> {
  const db = await getDB();
  return (await db.get("growth", id)) ?? null;
}

export async function updateGrowth(
  id: string,
  data: Partial<Omit<GrowthRecord, "id" | "babyId" | "createdAt">>,
): Promise<GrowthRecord> {
  const db = await getDB();
  const existing = await db.get("growth", id);
  if (!existing) throw new Error("Growth record not found");

  const parsedData = growthRecordSchema.parse({
    ...existing,
    ...data,
  });

  const updated: GrowthRecord = {
    ...existing,
    ...parsedData,
  };

  await db.put("growth", updated);
  return updated;
}

export async function deleteGrowth(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("growth", id);
}

export async function getGrowthByBabyId(babyId: string): Promise<GrowthRecord[]> {
  const db = await getDB();
  const tx = db.transaction("growth");
  const index = tx.store.index("byBabyIdAndCreated");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const all = await index.getAll(range);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getLatestGrowth(babyId: string): Promise<GrowthRecord | null> {
  const db = await getDB();
  const tx = db.transaction("growth");
  const index = tx.store.index("byBabyIdAndCreated");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const cursor = await index.openCursor(range, "prev");
  return cursor?.value ?? null;
}

export async function getRecentGrowthRecords(
  babyId: string,
  limit: number
): Promise<GrowthRecord[]> {
  const db = await getDB();
  const tx = db.transaction("growth");
  const index = tx.store.index("byBabyIdAndCreated");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const results: GrowthRecord[] = [];
  let cursor = await index.openCursor(range, "prev");
  while (cursor && results.length < limit) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}
