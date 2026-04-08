import type { SymptomEpisode } from "../types";
import { getDB } from "../index";
import { generateId } from "../utils";
import {
  symptomEpisodeInputSchema,
  symptomEpisodeResolveSchema,
  symptomEpisodeUpdateSchema,
} from "@/features/symptoms/validation";

export async function saveSymptomEpisode(
  data: Omit<SymptomEpisode, "id" | "createdAt" | "updatedAt">
): Promise<SymptomEpisode> {
  const db = await getDB();
  const parsedData = symptomEpisodeInputSchema.parse(data);
  const now = new Date().toISOString();

  const record: SymptomEpisode = {
    id: generateId(),
    ...parsedData,
    createdAt: now,
    updatedAt: now,
  };

  await db.put("symptomEpisodes", record);
  return record;
}

export async function updateSymptomEpisode(
  id: string,
  data: Partial<
    Omit<SymptomEpisode, "id" | "babyId" | "createdAt" | "updatedAt">
  >
): Promise<SymptomEpisode> {
  const db = await getDB();
  const existing = await db.get("symptomEpisodes", id);

  if (!existing) {
    throw new Error("Symptom episode not found");
  }

  const parsedUpdate = symptomEpisodeUpdateSchema.parse(data);
  const parsedRecord = symptomEpisodeInputSchema.parse({
    ...existing,
    ...parsedUpdate,
  });

  const updated: SymptomEpisode = {
    ...existing,
    ...parsedRecord,
    updatedAt: new Date().toISOString(),
  };

  await db.put("symptomEpisodes", updated);
  return updated;
}

export async function resolveSymptomEpisode(
  id: string,
  data: { resolvedAt: string; resolutionNotes?: string }
): Promise<SymptomEpisode> {
  const db = await getDB();
  const existing = await db.get("symptomEpisodes", id);

  if (!existing) {
    throw new Error("Symptom episode not found");
  }

  const parsedResolution = symptomEpisodeResolveSchema.parse(data);
  const parsedRecord = symptomEpisodeInputSchema.parse({
    ...existing,
    status: "resolved",
    resolvedAt: parsedResolution.resolvedAt,
    resolutionNotes: parsedResolution.resolutionNotes,
  });

  const updated: SymptomEpisode = {
    ...existing,
    ...parsedRecord,
    updatedAt: new Date().toISOString(),
  };

  await db.put("symptomEpisodes", updated);
  return updated;
}

export async function deleteSymptomEpisode(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("symptomEpisodes", id);
}

export async function getActiveSymptomEpisodes(
  babyId: string
): Promise<SymptomEpisode[]> {
  const db = await getDB();
  const tx = db.transaction("symptomEpisodes");
  const index = tx.store.index("byBabyIdAndStatus");
  const range = IDBKeyRange.only([babyId, "active"]);
  const records = await index.getAll(range);

  return records.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function getSymptomEpisodesByBabyId(
  babyId: string
): Promise<SymptomEpisode[]> {
  const db = await getDB();
  const tx = db.transaction("symptomEpisodes");
  const index = tx.store.index("byBabyId");
  const records = await index.getAll(babyId);

  return records.sort((a, b) =>
    (b.resolvedAt ?? b.startedAt).localeCompare(a.resolvedAt ?? a.startedAt)
  );
}

export async function getResolvedSymptomEpisodes(
  babyId: string
): Promise<SymptomEpisode[]> {
  const db = await getDB();
  const tx = db.transaction("symptomEpisodes");
  const index = tx.store.index("byBabyIdAndStatus");
  const range = IDBKeyRange.only([babyId, "resolved"]);
  const records = await index.getAll(range);

  return records.sort((a, b) =>
    (b.resolvedAt ?? b.updatedAt).localeCompare(a.resolvedAt ?? a.updatedAt)
  );
}

export async function getRecentSymptomEpisodes(
  babyId: string,
  limit: number
): Promise<SymptomEpisode[]> {
  const [activeEpisodes, resolvedEpisodes] = await Promise.all([
    getActiveSymptomEpisodes(babyId),
    getResolvedSymptomEpisodes(babyId),
  ]);

  return [...activeEpisodes, ...resolvedEpisodes]
    .sort((a, b) =>
      (b.resolvedAt ?? b.startedAt).localeCompare(a.resolvedAt ?? a.startedAt)
    )
    .slice(0, limit);
}
