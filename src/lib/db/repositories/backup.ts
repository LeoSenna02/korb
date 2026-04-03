import type { Baby } from "../types";
import type { MilestoneRecord } from "@/features/milestones/types";
import type { AppSettings, BabyBackupPayload } from "@/features/profile/types";
import { getDB } from "../index";
import { generateId } from "../utils";
import { getDiapersByBabyId } from "./diaper";
import { getFeedingsByBabyId } from "./feeding";
import { getGrowthByBabyId } from "./growth";
import { getMilestonesByBabyId } from "./milestone";
import { getSleepsByBabyId } from "./sleep";

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

export async function createBabyBackupSnapshot(
  baby: Baby,
  settings: AppSettings
): Promise<BabyBackupPayload> {
  const [feedings, sleeps, diapers, growth, milestones] = await Promise.all([
    getFeedingsByBabyId(baby.id),
    getSleepsByBabyId(baby.id),
    getDiapersByBabyId(baby.id),
    getGrowthByBabyId(baby.id),
    getMilestonesByBabyId(baby.id),
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
    ["babies", "feedings", "diapers", "growth", "sleeps", "milestones"],
    "readwrite"
  );

  const babyStore = tx.objectStore("babies");
  const feedingsStore = tx.objectStore("feedings");
  const diapersStore = tx.objectStore("diapers");
  const growthStore = tx.objectStore("growth");
  const sleepsStore = tx.objectStore("sleeps");
  const milestonesStore = tx.objectStore("milestones");

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
  ] = await Promise.all([
    feedingsStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
    diapersStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
    growthStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
    sleepsStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
    milestonesStore.index("byBabyId").getAllKeys(IDBKeyRange.only(currentBaby.id)),
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

  await tx.done;
}
