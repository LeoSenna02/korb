import {
  combineDateAndTimeToIso,
  getLocalDateKey,
  getLocalTimeValue,
} from "@/lib/utils/format";
import type {
  AppointmentFormValues,
  AppointmentListItem,
  AttendAppointmentFormValues,
  FollowUpDraft,
  PediatricAppointment,
  PediatricAppointmentDisplayStatus,
} from "./types";

export function getTodayDateValue(): string {
  return getLocalDateKey(new Date().toISOString());
}

export function getCurrentTimeValue(): string {
  return getLocalTimeValue(new Date().toISOString());
}

export function buildEmptyAppointmentFormValues(): AppointmentFormValues {
  return {
    doctorName: "",
    location: "",
    reason: "",
    scheduledDate: getTodayDateValue(),
    scheduledTime: getCurrentTimeValue(),
    preVisitNotes: "",
  };
}

export function buildAppointmentFormValues(
  appointment?: PediatricAppointment | null
): AppointmentFormValues {
  if (!appointment) {
    return buildEmptyAppointmentFormValues();
  }

  return {
    doctorName: appointment.doctorName,
    location: appointment.location,
    reason: appointment.reason,
    scheduledDate: getLocalDateKey(appointment.scheduledAt),
    scheduledTime: getLocalTimeValue(appointment.scheduledAt),
    preVisitNotes: appointment.preVisitNotes ?? "",
  };
}

export function buildEmptyAttendFormValues(
  appointment?: PediatricAppointment | null
): AttendAppointmentFormValues {
  return {
    postVisitNotes: appointment?.postVisitNotes ?? "",
    followUpIntervalDays:
      appointment?.followUpIntervalDays != null
        ? String(appointment.followUpIntervalDays)
        : "",
    followUpInstructions: appointment?.followUpInstructions ?? "",
    linkedGrowthId: appointment?.linkedGrowthId,
    linkedVaccineIds: appointment?.linkedVaccineIds ?? [],
  };
}

export function getAppointmentDisplayStatus(
  appointment: PediatricAppointment,
  now: Date = new Date()
): PediatricAppointmentDisplayStatus {
  if (appointment.status === "attended") {
    return "attended";
  }

  return new Date(appointment.scheduledAt) < now ? "overdue" : "scheduled";
}

export function withDisplayStatus(
  appointment: PediatricAppointment,
  now?: Date
): AppointmentListItem {
  return {
    ...appointment,
    displayStatus: getAppointmentDisplayStatus(appointment, now),
  };
}

export function buildScheduledAtFromForm(
  values: AppointmentFormValues
): string {
  return combineDateAndTimeToIso(values.scheduledDate, values.scheduledTime);
}

export function parseFollowUpIntervalDays(value: string): number | undefined {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

export function buildFollowUpDraft(
  appointment: PediatricAppointment,
  intervalDays: number
): FollowUpDraft {
  const nextDate = new Date(appointment.scheduledAt);
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    doctorName: appointment.doctorName,
    location: appointment.location,
    reason: appointment.reason,
    scheduledAt: nextDate.toISOString(),
    preVisitNotes: appointment.followUpInstructions ?? undefined,
  };
}
