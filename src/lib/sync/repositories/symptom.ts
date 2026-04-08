import type { SymptomEpisode } from "@/lib/db/types";
import * as idb from "@/lib/db/repositories/symptom";
import { syncEngine } from "../engine";
import { symptomEpisodeToRow } from "../mappers";

export async function saveSymptomEpisode(
  data: Omit<SymptomEpisode, "id" | "createdAt" | "updatedAt">
): Promise<SymptomEpisode> {
  const record = await idb.saveSymptomEpisode(data);
  syncEngine
    .syncRecord("symptomEpisodes", symptomEpisodeToRow(record), "upsert")
    .catch(console.warn);
  return record;
}

export async function updateSymptomEpisode(
  id: string,
  data: Partial<
    Omit<SymptomEpisode, "id" | "babyId" | "createdAt" | "updatedAt">
  >
): Promise<SymptomEpisode> {
  const record = await idb.updateSymptomEpisode(id, data);
  syncEngine
    .syncRecord("symptomEpisodes", symptomEpisodeToRow(record), "upsert")
    .catch(console.warn);
  return record;
}

export async function resolveSymptomEpisode(
  id: string,
  data: { resolvedAt: string; resolutionNotes?: string }
): Promise<SymptomEpisode> {
  const record = await idb.resolveSymptomEpisode(id, data);
  syncEngine
    .syncRecord("symptomEpisodes", symptomEpisodeToRow(record), "upsert")
    .catch(console.warn);
  return record;
}

export async function deleteSymptomEpisode(id: string): Promise<void> {
  await idb.deleteSymptomEpisode(id);
  syncEngine.syncRecord("symptomEpisodes", { id }, "delete").catch(console.warn);
}

export async function getActiveSymptomEpisodes(
  babyId: string
): Promise<SymptomEpisode[]> {
  return idb.getActiveSymptomEpisodes(babyId);
}

export async function getSymptomEpisodesByBabyId(
  babyId: string
): Promise<SymptomEpisode[]> {
  return idb.getSymptomEpisodesByBabyId(babyId);
}

export async function getResolvedSymptomEpisodes(
  babyId: string
): Promise<SymptomEpisode[]> {
  return idb.getResolvedSymptomEpisodes(babyId);
}

export async function getRecentSymptomEpisodes(
  babyId: string,
  limit: number
): Promise<SymptomEpisode[]> {
  return idb.getRecentSymptomEpisodes(babyId, limit);
}
