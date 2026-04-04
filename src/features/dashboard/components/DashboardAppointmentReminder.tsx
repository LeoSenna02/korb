"use client";

import { useRouter } from "next/navigation";
import { useAppSettings } from "@/features/profile/hooks/useAppSettings";
import { useAppointments } from "@/features/consultas/hooks/useAppointments";
import { useAppointmentReminders } from "@/features/consultas/hooks/useAppointmentReminders";
import { AppointmentReminderBanner } from "@/features/consultas/components/AppointmentReminderBanner";
import { useBaby } from "@/contexts/BabyContext";

export function DashboardAppointmentReminder() {
  const router = useRouter();
  const { baby } = useBaby();
  const { settings, isHydrated } = useAppSettings();
  const { appointments, isLoading } = useAppointments();
  const { dashboardReminderCard, dismissDashboardReminder } = useAppointmentReminders({
    appointments,
    babyId: baby?.id,
    enabled: settings.notificationsEnabled,
  });

  if (!isHydrated || isLoading || !dashboardReminderCard) {
    return null;
  }

  return (
    <div className="mb-8">
      <AppointmentReminderBanner
        reminder={dashboardReminderCard}
        compact
        title="Consulta nas proximas 24h"
        description="Abra a agenda pediatrica para revisar os detalhes e se preparar sem poluir a dashboard."
        actionLabel="Abrir consultas"
        onAction={() => router.push("/dashboard/consultas")}
        onDismiss={dismissDashboardReminder}
      />
    </div>
  );
}
