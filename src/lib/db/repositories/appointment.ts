import type {
  GrowthRecord,
  PediatricAppointment,
  PediatricAppointmentStatus,
} from "../types";
import { attendAppointmentSubmitSchema } from "@/features/consultas/validation";
import type { VaccineRecord } from "@/features/vaccines/types";
import { getLocalDateKey } from "@/lib/utils/format";
import { getDB } from "../index";
import { generateId } from "../utils";
import { getGrowthByBabyId } from "./growth";
import { getVaccinesByBabyId } from "./vaccine";

interface AppointmentLinkSuggestions {
  growthRecords: GrowthRecord[];
  vaccineRecords: VaccineRecord[];
}

function sanitizeLinkedVaccineIds(ids?: string[]): string[] {
  if (!ids) {
    return [];
  }

  return Array.from(new Set(ids.filter(Boolean)));
}

export async function saveAppointment(
  data: Omit<PediatricAppointment, "id" | "createdAt" | "updatedAt">
): Promise<PediatricAppointment> {
  const db = await getDB();
  const now = new Date().toISOString();

  const record: PediatricAppointment = {
    id: generateId(),
    ...data,
    linkedVaccineIds: sanitizeLinkedVaccineIds(data.linkedVaccineIds),
    createdAt: now,
    updatedAt: now,
  };

  await db.put("appointments", record);
  return record;
}

export async function updateAppointment(
  id: string,
  data: Partial<
    Omit<PediatricAppointment, "id" | "babyId" | "createdAt" | "updatedAt">
  >
): Promise<PediatricAppointment> {
  const db = await getDB();
  const existing = await db.get("appointments", id);

  if (!existing) {
    throw new Error("Appointment not found");
  }

  const updated: PediatricAppointment = {
    ...existing,
    ...data,
    linkedVaccineIds: sanitizeLinkedVaccineIds(
      data.linkedVaccineIds ?? existing.linkedVaccineIds
    ),
    updatedAt: new Date().toISOString(),
  };

  await db.put("appointments", updated);
  return updated;
}

export async function deleteAppointment(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("appointments", id);
}

export async function markAppointmentAsAttended(
  id: string,
  data: {
    attendedAt?: string;
    postVisitNotes?: string;
    followUpIntervalDays?: number;
    followUpInstructions?: string;
    growthData?: {
      weightKg?: number;
      heightCm?: number;
      cephalicCm?: number;
      measuredAt: string;
    };
    linkedGrowthId?: string;
    linkedVaccineIds?: string[];
  }
): Promise<PediatricAppointment> {
  const parsedData = attendAppointmentSubmitSchema.parse({
    postVisitNotes: data.postVisitNotes,
    followUpIntervalDays: data.followUpIntervalDays,
    followUpInstructions: data.followUpInstructions,
    growthData: data.growthData,
    linkedGrowthId: data.linkedGrowthId,
    linkedVaccineIds: sanitizeLinkedVaccineIds(data.linkedVaccineIds),
  });
  const db = await getDB();
  const tx = db.transaction(["appointments", "growth"], "readwrite");
  const appointmentsStore = tx.objectStore("appointments");
  const growthStore = tx.objectStore("growth");
  const existing = await appointmentsStore.get(id);

  if (!existing) {
    throw new Error("Appointment not found");
  }

  let nextLinkedGrowthId = parsedData.linkedGrowthId;

  if (parsedData.growthData) {
    const growthId = parsedData.linkedGrowthId ?? generateId();
    const existingGrowth = parsedData.linkedGrowthId
      ? await growthStore.get(parsedData.linkedGrowthId)
      : undefined;

    const growthRecord: GrowthRecord = existingGrowth
      ? {
          ...existingGrowth,
          ...parsedData.growthData,
        }
      : {
          id: growthId,
          babyId: existing.babyId,
          createdAt: new Date().toISOString(),
          ...parsedData.growthData,
        };

    await growthStore.put(growthRecord);
    nextLinkedGrowthId = growthRecord.id;
  }

  const updated: PediatricAppointment = {
    ...existing,
    status: "attended" satisfies PediatricAppointmentStatus,
    attendedAt: data.attendedAt ?? existing.attendedAt ?? new Date().toISOString(),
    postVisitNotes: parsedData.postVisitNotes,
    followUpIntervalDays: parsedData.followUpIntervalDays,
    followUpInstructions: parsedData.followUpInstructions,
    linkedGrowthId: nextLinkedGrowthId,
    linkedVaccineIds: parsedData.linkedVaccineIds,
    updatedAt: new Date().toISOString(),
  };

  await appointmentsStore.put(updated);
  await tx.done;

  return updated;
}

export async function getAppointmentsByBabyId(
  babyId: string
): Promise<PediatricAppointment[]> {
  const db = await getDB();
  const tx = db.transaction("appointments");
  const index = tx.store.index("byBabyIdAndScheduledAt");
  const range = IDBKeyRange.bound([babyId, ""], [babyId, "\uffff"]);
  const all = await index.getAll(range);
  return all.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export async function getRecentAttendedAppointments(
  babyId: string,
  limit: number
): Promise<PediatricAppointment[]> {
  const appointments = await getAppointmentsByBabyId(babyId);

  return appointments
    .filter((appointment) => appointment.status === "attended")
    .sort((a, b) =>
      (b.attendedAt ?? b.updatedAt).localeCompare(a.attendedAt ?? a.updatedAt)
    )
    .slice(0, limit);
}

export async function getAppointmentLinkSuggestions(
  babyId: string,
  scheduledAt: string
): Promise<AppointmentLinkSuggestions> {
  const [growthRecords, vaccineRecords] = await Promise.all([
    getGrowthByBabyId(babyId),
    getVaccinesByBabyId(babyId),
  ]);

  const targetDateKey = getLocalDateKey(scheduledAt);

  return {
    growthRecords: growthRecords.filter(
      (record) => getLocalDateKey(record.measuredAt) === targetDateKey
    ),
    vaccineRecords: vaccineRecords.filter(
      (record) =>
        Boolean(record.appliedDate) &&
        getLocalDateKey(record.appliedDate ?? "") === targetDateKey
    ),
  };
}
