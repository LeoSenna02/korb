"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  AppointmentListItem,
  AppointmentReminderCardState,
  AppointmentReminderKind,
  ConsultasReminderState,
  DismissedAppointmentReminder,
  PediatricAppointmentDisplayStatus,
} from "../types";

const APPOINTMENT_REMINDER_STORAGE_KEY = "korb:appointment-reminders:dismissed";
const APPOINTMENT_REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;
const APPOINTMENT_REMINDER_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const APPOINTMENT_REMINDER_MAX_DISMISSED = 30;

function readDismissedAppointmentReminders(): DismissedAppointmentReminder[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(APPOINTMENT_REMINDER_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as DismissedAppointmentReminder[];
  } catch {
    return [];
  }
}

function writeDismissedAppointmentReminders(
  reminders: DismissedAppointmentReminder[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    APPOINTMENT_REMINDER_STORAGE_KEY,
    JSON.stringify(reminders)
  );
}

function pruneDismissedAppointmentReminders(
  reminders: DismissedAppointmentReminder[]
): DismissedAppointmentReminder[] {
  const cutoff = Date.now() - APPOINTMENT_REMINDER_RETENTION_MS;

  return reminders
    .filter((reminder) => new Date(reminder.dismissedAt).getTime() >= cutoff)
    .slice(-APPOINTMENT_REMINDER_MAX_DISMISSED);
}

function buildAppointmentReminderKey(
  babyId: string,
  appointment: AppointmentListItem,
  kind: AppointmentReminderKind
): string {
  return [
    babyId,
    appointment.id,
    appointment.scheduledAt,
    appointment.displayStatus,
    kind,
  ].join(":");
}

function formatReminderDistanceLabel(
  scheduledAt: string,
  status: PediatricAppointmentDisplayStatus,
  now: Date
): string {
  const scheduledAtMs = new Date(scheduledAt).getTime();
  const diffMs = scheduledAtMs - now.getTime();
  const absMinutes = Math.max(1, Math.floor(Math.abs(diffMs) / 60000));
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;

  if (status === "overdue" || diffMs < 0) {
    if (absMinutes < 60) {
      return absMinutes === 1 ? "Atrasada ha 1 min" : `Atrasada ha ${absMinutes} min`;
    }

    if (minutes === 0) {
      return hours === 1 ? "Atrasada ha 1h" : `Atrasada ha ${hours}h`;
    }

    return `Atrasada ha ${hours}h ${minutes}min`;
  }

  if (absMinutes < 60) {
    return absMinutes === 1 ? "Em 1 min" : `Em ${absMinutes} min`;
  }

  if (minutes === 0) {
    return hours === 1 ? "Em 1h" : `Em ${hours}h`;
  }

  return `Em ${hours}h ${minutes}min`;
}

function getNearestUpcomingAppointment(
  appointments: AppointmentListItem[],
  now: Date
): AppointmentListItem | null {
  const nowMs = now.getTime();

  for (const appointment of appointments) {
    if (appointment.displayStatus !== "scheduled") {
      continue;
    }

    const scheduledAtMs = new Date(appointment.scheduledAt).getTime();
    const diffMs = scheduledAtMs - nowMs;

    if (diffMs >= 0 && diffMs <= APPOINTMENT_REMINDER_WINDOW_MS) {
      return appointment;
    }
  }

  return null;
}

function buildReminderCardState(params: {
  appointment: AppointmentListItem;
  kind: AppointmentReminderKind;
  babyId: string;
  dismissedReminders: DismissedAppointmentReminder[];
  now: Date;
}): AppointmentReminderCardState {
  const { appointment, kind, babyId, dismissedReminders, now } = params;
  const key = buildAppointmentReminderKey(babyId, appointment, kind);
  const isDismissed = dismissedReminders.some((reminder) => reminder.key === key);

  return {
    appointment,
    kind,
    isDismissed,
    visible: !isDismissed,
    timeUntilLabel: formatReminderDistanceLabel(
      appointment.scheduledAt,
      appointment.displayStatus,
      now
    ),
  };
}

interface UseAppointmentRemindersParams {
  appointments: AppointmentListItem[];
  babyId?: string;
  enabled: boolean;
  now?: Date;
}

interface UseAppointmentRemindersReturn {
  nearestUpcomingAppointment: AppointmentListItem | null;
  overdueAppointments: AppointmentListItem[];
  dashboardReminderCard: AppointmentReminderCardState | null;
  consultasReminderState: ConsultasReminderState;
  dismissDashboardReminder: () => void;
}

export function useAppointmentReminders(
  params: UseAppointmentRemindersParams
): UseAppointmentRemindersReturn {
  const { appointments, babyId, enabled, now = new Date() } = params;
  const [dismissedReminders, setDismissedReminders] = useState<
    DismissedAppointmentReminder[]
  >(() => pruneDismissedAppointmentReminders(readDismissedAppointmentReminders()));

  const overdueAppointments = useMemo(
    () =>
      appointments.filter((appointment) => appointment.displayStatus === "overdue"),
    [appointments]
  );

  const nearestUpcomingAppointment = useMemo(
    () => getNearestUpcomingAppointment(appointments, now),
    [appointments, now]
  );

  const dashboardReminderCard = useMemo(() => {
    if (!enabled || !babyId || !nearestUpcomingAppointment) {
      return null;
    }

    const reminder = buildReminderCardState({
      appointment: nearestUpcomingAppointment,
      kind: "upcoming",
      babyId,
      dismissedReminders,
      now,
    });

    return reminder.visible ? reminder : null;
  }, [enabled, babyId, nearestUpcomingAppointment, dismissedReminders, now]);

  const consultasReminderState = useMemo<ConsultasReminderState>(() => {
    if (!enabled || !babyId) {
      return {
        primaryReminder: null,
        secondaryReminder: null,
      };
    }

    const primaryOverdue = overdueAppointments[0]
      ? buildReminderCardState({
          appointment: overdueAppointments[0],
          kind: "overdue",
          babyId,
          dismissedReminders: [],
          now,
        })
      : null;

    const secondaryUpcoming = nearestUpcomingAppointment
      ? buildReminderCardState({
          appointment: nearestUpcomingAppointment,
          kind: "upcoming",
          babyId,
          dismissedReminders: [],
          now,
        })
      : null;

    return {
      primaryReminder: primaryOverdue ?? secondaryUpcoming,
      secondaryReminder: primaryOverdue && secondaryUpcoming ? secondaryUpcoming : null,
    };
  }, [enabled, babyId, overdueAppointments, nearestUpcomingAppointment, now]);

  const dismissDashboardReminder = useCallback(() => {
    if (!babyId || !nearestUpcomingAppointment) {
      return;
    }

    const nextReminder: DismissedAppointmentReminder = {
      key: buildAppointmentReminderKey(
        babyId,
        nearestUpcomingAppointment,
        "upcoming"
      ),
      appointmentId: nearestUpcomingAppointment.id,
      scheduledAt: nearestUpcomingAppointment.scheduledAt,
      status: nearestUpcomingAppointment.displayStatus,
      dismissedAt: new Date().toISOString(),
    };

    setDismissedReminders((currentReminders) => {
      const filteredReminders = currentReminders.filter(
        (reminder) => reminder.key !== nextReminder.key
      );
      const nextReminders = pruneDismissedAppointmentReminders([
        ...filteredReminders,
        nextReminder,
      ]);
      writeDismissedAppointmentReminders(nextReminders);
      return nextReminders;
    });
  }, [babyId, nearestUpcomingAppointment]);

  return {
    nearestUpcomingAppointment,
    overdueAppointments,
    dashboardReminderCard,
    consultasReminderState,
    dismissDashboardReminder,
  };
}
