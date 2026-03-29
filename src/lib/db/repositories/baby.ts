import type { Baby } from "../types";
import { getDB } from "../index";
import { generateId } from "../utils";

export async function saveBaby(
  data: Omit<Baby, "id" | "createdAt" | "updatedAt">
): Promise<Baby> {
  const db = await getDB();
  const now = new Date().toISOString();
  const baby: Baby = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  await db.put("babies", baby);
  return baby;
}

export async function getBabyByUserId(userId: string): Promise<Baby | null> {
  const db = await getDB();
  const tx = db.transaction("babies");
  const index = tx.store.index("byUserId");
  const result = await index.get(userId);
  return result ?? null;
}

export async function getBabyById(id: string): Promise<Baby | null> {
  const db = await getDB();
  const result = await db.get("babies", id);
  return result ?? null;
}

export async function updateBaby(
  id: string,
  data: Partial<Omit<Baby, "id" | "userId" | "createdAt">>
): Promise<Baby> {
  const db = await getDB();
  const existing = await db.get("babies", id);
  if (!existing) throw new Error("Baby not found");
  const updated: Baby = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await db.put("babies", updated);
  return updated;
}

export async function deleteBaby(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("babies", id);
}
