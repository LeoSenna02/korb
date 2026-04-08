"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { createBabyBackupSnapshot } from "@/lib/db/repositories/backup";
import { getDB } from "@/lib/db";
import {
  feedingToRow,
  diaperToRow,
  growthToRow,
  sleepToRow,
  milestoneToRow,
  vaccineToRow,
  appointmentToRow,
  symptomEpisodeToRow,
} from "@/lib/sync/mappers";
import type { Baby } from "@/lib/db/types";
import type { AppSettings } from "../types";

export type MigrationStage =
  | "idle"
  | "preparing"
  | "babies"
  | "feedings"
  | "diapers"
  | "growth"
  | "sleeps"
  | "milestones"
  | "vaccines"
  | "appointments"
  | "symptoms"
  | "done"
  | "error";

export interface MigrationProgress {
  stage: MigrationStage;
  current: number;
  total: number;
  error: string | null;
}

const CHUNK_SIZE = 100;

async function uploadChunks<T extends { id: string }>(
  supabase: ReturnType<typeof createClient>,
  table: string,
  rows: T[]
): Promise<void> {
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase
      .from(table as never)
      .upsert(chunk as never, { onConflict: "id" });
    if (error) throw new Error(`[${table}] ${error.message}`);
  }
}

async function markSyncedInIDB(store: string, ids: string[]): Promise<void> {
  const db = await getDB();
  for (const id of ids) {
    const record = await db.get(store as never, id);
    if (record) await db.put(store as never, { ...record, synced: true });
  }
}

export function useCloudMigration(baby: Baby | null, settings: AppSettings) {
  const [progress, setProgress] = useState<MigrationProgress>({
    stage: "idle",
    current: 0,
    total: 0,
    error: null,
  });

  const setStage = (stage: MigrationStage, current = 0, total = 0) =>
    setProgress({ stage, current, total, error: null });

  const setError = (error: string) =>
    setProgress((p) => ({ ...p, stage: "error", error }));

  const migrate = useCallback(async () => {
    if (!baby) return;
    const supabase = createClient();

    try {
      // 1. Prepare snapshot
      setStage("preparing");
      const snapshot = await createBabyBackupSnapshot(baby, settings);

      // 2. Upsert baby via RPC (atomic + RLS-safe)
      setStage("babies", 0, 1);
      const { error: rpcError } = await supabase.rpc(
        "create_baby_with_owner",
        {
          p_id: baby.id,
          p_name: baby.name,
          p_family_name: baby.familyName,
          p_birth_date: baby.birthDate,
          p_birth_time: baby.birthTime ?? null,
          p_gender: baby.gender,
          p_blood_type: baby.bloodType ?? null,
          p_photo_url: baby.photoUrl ?? null,
        } as never
      );
      if (rpcError) throw new Error(`[babies] ${rpcError.message}`);
      setStage("babies", 1, 1);

      // 3. Feedings
      const feedingRows = snapshot.records.feedings
        .filter((r) => !("synced" in r && r.synced))
        .map(feedingToRow);
      setStage("feedings", 0, feedingRows.length);
      await uploadChunks(supabase, "feedings", feedingRows);
      await markSyncedInIDB("feedings", feedingRows.map((r) => r.id));
      setStage("feedings", feedingRows.length, feedingRows.length);

      // 4. Diapers
      const diaperRows = snapshot.records.diapers
        .filter((r) => !("synced" in r && r.synced))
        .map(diaperToRow);
      setStage("diapers", 0, diaperRows.length);
      await uploadChunks(supabase, "diapers", diaperRows);
      await markSyncedInIDB("diapers", diaperRows.map((r) => r.id));
      setStage("diapers", diaperRows.length, diaperRows.length);

      // 5. Growth
      const growthRows = snapshot.records.growth
        .filter((r) => !("synced" in r && r.synced))
        .map(growthToRow);
      setStage("growth", 0, growthRows.length);
      await uploadChunks(supabase, "growth", growthRows);
      await markSyncedInIDB("growth", growthRows.map((r) => r.id));
      setStage("growth", growthRows.length, growthRows.length);

      // 6. Sleeps
      const sleepRows = snapshot.records.sleeps
        .filter((r) => !("synced" in r && r.synced))
        .map(sleepToRow);
      setStage("sleeps", 0, sleepRows.length);
      await uploadChunks(supabase, "sleeps", sleepRows);
      await markSyncedInIDB("sleeps", sleepRows.map((r) => r.id));
      setStage("sleeps", sleepRows.length, sleepRows.length);

      // 7. Milestones
      const milestoneRows = snapshot.records.milestones
        .filter((r) => !("synced" in r && r.synced))
        .map(milestoneToRow);
      setStage("milestones", 0, milestoneRows.length);
      await uploadChunks(supabase, "milestones", milestoneRows);
      await markSyncedInIDB("milestones", milestoneRows.map((r) => r.id));
      setStage("milestones", milestoneRows.length, milestoneRows.length);

      // 8. Vaccines
      const vaccineRows = snapshot.records.vaccines
        .filter((r) => !("synced" in r && r.synced))
        .map(vaccineToRow);
      setStage("vaccines", 0, vaccineRows.length);
      await uploadChunks(supabase, "vaccines", vaccineRows);
      await markSyncedInIDB("vaccines", vaccineRows.map((r) => r.id));
      setStage("vaccines", vaccineRows.length, vaccineRows.length);

      // 9. Appointments
      const appointmentRows = snapshot.records.appointments
        .filter((r) => !("synced" in r && r.synced))
        .map(appointmentToRow);
      setStage("appointments", 0, appointmentRows.length);
      await uploadChunks(supabase, "appointments", appointmentRows);
      await markSyncedInIDB("appointments", appointmentRows.map((r) => r.id));
      setStage("appointments", appointmentRows.length, appointmentRows.length);

      const symptomRows = snapshot.records.symptoms
        .filter((r) => !("synced" in r && r.synced))
        .map(symptomEpisodeToRow);
      setStage("symptoms", 0, symptomRows.length);
      await uploadChunks(supabase, "symptom_episodes", symptomRows);
      await markSyncedInIDB("symptomEpisodes", symptomRows.map((r) => r.id));
      setStage("symptoms", symptomRows.length, symptomRows.length);

      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  }, [baby, settings]);

  const reset = useCallback(() => {
    setProgress({ stage: "idle", current: 0, total: 0, error: null });
  }, []);

  return { progress, migrate, reset };
}
