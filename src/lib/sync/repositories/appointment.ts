import type { PediatricAppointment } from "@/lib/db/types";
import * as idb from "@/lib/db/repositories/appointment";
import { getGrowthById } from "@/lib/db/repositories/growth";
import { syncEngine } from "../engine";
import { appointmentToRow, growthToRow } from "../mappers";

export async function saveAppointment(
  data: Omit<PediatricAppointment, "id" | "createdAt" | "updatedAt">
): Promise<PediatricAppointment> {
  const record = await idb.saveAppointment(data);
  syncEngine.syncRecord("appointments", appointmentToRow(record), "upsert").catch(console.warn);
  return record;
}

export async function updateAppointment(
  id: string,
  data: Partial<Omit<PediatricAppointment, "id" | "babyId" | "createdAt" | "updatedAt">>
): Promise<PediatricAppointment> {
  const record = await idb.updateAppointment(id, data);
  syncEngine.syncRecord("appointments", appointmentToRow(record), "upsert").catch(console.warn);
  return record;
}

export async function deleteAppointment(id: string): Promise<void> {
  await idb.deleteAppointment(id);
  syncEngine.syncRecord("appointments", { id }, "delete").catch(console.warn);
}

export async function markAppointmentAsAttended(
  id: string,
  data: Parameters<typeof idb.markAppointmentAsAttended>[1]
): Promise<PediatricAppointment> {
  const record = await idb.markAppointmentAsAttended(id, data);
  if (record.linkedGrowthId) {
    const growthRecord = await getGrowthById(record.linkedGrowthId);
    if (growthRecord) {
      syncEngine.syncRecord("growth", growthToRow(growthRecord), "upsert").catch(console.warn);
    }
  }
  syncEngine.syncRecord("appointments", appointmentToRow(record), "upsert").catch(console.warn);
  return record;
}

export async function getAppointmentsByBabyId(babyId: string): Promise<PediatricAppointment[]> {
  return idb.getAppointmentsByBabyId(babyId);
}

export async function getRecentAttendedAppointments(
  babyId: string,
  limit: number
): Promise<PediatricAppointment[]> {
  return idb.getRecentAttendedAppointments(babyId, limit);
}

export { getAppointmentLinkSuggestions } from "@/lib/db/repositories/appointment";
