import type { Baby, PediatricAppointment, SymptomEpisode } from "../types";
import type { MilestoneRecord } from "@/features/milestones/types";
import type { VaccineRecord } from "@/features/vaccines/types";
import type { AppSettings, BabyBackupPayload } from "@/features/profile/types";
import { getDB } from "../index";
import { generateId } from "../utils";
import { getDiapersByBabyId } from "./diaper";
import { getFeedingsByBabyId } from "./feeding";
import { getGrowthByBabyId } from "./growth";
import { getMilestonesByBabyId } from "./milestone";
import { getSleepsByBabyId } from "./sleep";
import { getVaccinesByBabyId } from "./vaccine";
import { getAppointmentsByBabyId } from "./appointment";
import { getSymptomEpisodesByBabyId } from "./symptom";
import { emitDataSyncEvent } from "@/lib/sync/events";
import { clearQueuedEntries } from "@/lib/sync/queue";
import type { StoreName } from "@/lib/sync/types";

const RESETTABLE_STORES = [
  "feedings",
  "diapers",
  "growth",
  "sleeps",
  "milestones",
  "vaccines",
  "appointments",
  "symptomEpisodes",
] as const satisfies readonly StoreName[];

function mapBabyToBackupProfile(baby: Baby): BabyBackupPayload["baby"] {
  return {
    name: baby.name,
    familyName: baby.familyName,
    birthDate: baby.birthDate,
    birthTime: baby.birthTime,
    gender: baby.gender,
    bloodType: baby.bloodType,
    photoUrl: baby.photoUrl,
  };
}

function remapMilestoneRecord(
  record: MilestoneRecord,
  babyId: string
): MilestoneRecord {
  return {
    ...record,
    id: generateId(),
    babyId,
  };
}

function remapVaccineRecord(
  record: VaccineRecord,
  babyId: string
): VaccineRecord {
  return {
    ...record,
    id: generateId(),
    babyId,
  };
}

function remapAppointmentRecord(
  record: PediatricAppointment,
  babyId: string
): PediatricAppointment {
  return {
    ...record,
    id: generateId(),
    babyId,
  };
}

function remapSymptomEpisodeRecord(
  record: SymptomEpisode,
  babyId: string
): SymptomEpisode {
  return {
    ...record,
    id: generateId(),
    babyId,
  };
}

export async function createBabyBackupSnapshot(
  baby: Baby,
  settings: AppSettings
): Promise<BabyBackupPayload> {
  const [feedings, sleeps, diapers, growth, milestones, vaccines, appointments, symptoms] = await Promise.all([
    getFeedingsByBabyId(baby.id),
    getSleepsByBabyId(baby.id),
    getDiapersByBabyId(baby.id),
    getGrowthByBabyId(baby.id),
    getMilestonesByBabyId(baby.id),
    getVaccinesByBabyId(baby.id),
    getAppointmentsByBabyId(baby.id),
    getSymptomEpisodesByBabyId(baby.id),
  ]);

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    baby: mapBabyToBackupProfile(baby),
    records: {
      feedings,
      sleeps,
      diapers,
      growth,
      milestones,
      vaccines,
      appointments,
      symptoms,
    },
    settings,
  };
}

export async function replaceBabyDataFromBackup(
  currentBaby: Baby,
  payload: BabyBackupPayload
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ["babies", "feedings", "diapers", "growth", "sleeps", "milestones", "vaccines", "appointments", "symptomEpisodes"],
    "readwrite"
  );

  const babyStore = tx.objectStore("babies");
  const feedingsStore = tx.objectStore("feedings");
  const diapersStore = tx.objectStore("diapers");
  const growthStore = tx.objectStore("growth");
  const sleepsStore = tx.objectStore("sleeps");
  const milestonesStore = tx.objectStore("milestones");
  const vaccinesStore = tx.objectStore("vaccines");
  const appointmentsStore = tx.objectStore("appointments");
  const symptomEpisodesStore = tx.objectStore("symptomEpisodes");

  const now = new Date().toISOString();
  const updatedBaby: Baby = {
    ...currentBaby,
    ...payload.baby,
    updatedAt: now,
  };

  await babyStore.put(updatedBaby);

  const [
    feedingKeys,
    diaperKeys,
    growthKeys,
    sleepKeys,
    milestoneKeys,
    vaccineKeys,
    appointmentKeys,
    symptomEpisodeKeys,
  ] = await Promise.all([
    feedingsStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
    diapersStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
    growthStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
    sleepsStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
    milestonesStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
    vaccinesStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
    appointmentsStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
    symptomEpisodesStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
  ]);

  for (const key of feedingKeys) {
    await feedingsStore.delete(key);
  }

  for (const key of diaperKeys) {
    await diapersStore.delete(key);
  }

  for (const key of growthKeys) {
    await growthStore.delete(key);
  }

  for (const key of sleepKeys) {
    await sleepsStore.delete(key);
  }

  for (const key of milestoneKeys) {
    await milestonesStore.delete(key);
  }

  for (const key of vaccineKeys) {
    await vaccinesStore.delete(key);
  }

  for (const key of appointmentKeys) {
    await appointmentsStore.delete(key);
  }

  for (const key of symptomEpisodeKeys) {
    await symptomEpisodesStore.delete(key);
  }

  for (const record of payload.records.feedings) {
    await feedingsStore.put({
      ...record,
      id: generateId(),
      babyId: currentBaby.id,
    });
  }

  for (const record of payload.records.diapers) {
    await diapersStore.put({
      ...record,
      id: generateId(),
      babyId: currentBaby.id,
    });
  }

  for (const record of payload.records.growth) {
    await growthStore.put({
      ...record,
      id: generateId(),
      babyId: currentBaby.id,
    });
  }

  for (const record of payload.records.sleeps) {
    await sleepsStore.put({
      ...record,
      id: generateId(),
      babyId: currentBaby.id,
    });
  }

  for (const record of payload.records.milestones) {
    await milestonesStore.put(remapMilestoneRecord(record, currentBaby.id));
  }

  for (const record of payload.records.vaccines) {
    await vaccinesStore.put(remapVaccineRecord(record, currentBaby.id));
  }

  for (const record of payload.records.appointments) {
    await appointmentsStore.put(remapAppointmentRecord(record, currentBaby.id));
  }

  for (const record of payload.records.symptoms) {
    await symptomEpisodesStore.put(
      remapSymptomEpisodeRecord(record, currentBaby.id)
    );
  }

  await tx.done;
  emitDataSyncEvent();
}

export async function clearBabyData(currentBaby: Baby): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(RESETTABLE_STORES, "readwrite");
  const queuedEntriesToClear: Array<{ store: StoreName; recordId: string }> = [];

  for (const storeName of RESETTABLE_STORES) {
    const store = tx.objectStore(storeName);
    const recordKeys = await store.index("byBabyId").getAllKeys(currentBaby.id);

    for (const key of recordKeys) {
      await store.delete(key);
      queuedEntriesToClear.push({
        store: storeName,
        recordId: String(key),
      });
    }
  }

  await tx.done;
  await clearQueuedEntries(queuedEntriesToClear);
  emitDataSyncEvent();
}
