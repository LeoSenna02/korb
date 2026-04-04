"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal, LoadingScreen } from "@/components/ui";
import { useBaby } from "@/contexts/BabyContext";
import { useAuth } from "@/lib/auth/hooks";
import {
  deleteAppointment,
  saveAppointment,
} from "@/lib/db/repositories/appointment";
import { formatDate } from "@/lib/utils/format";
import type {
  AppointmentListItem,
  FollowUpDraft,
  PediatricAppointment,
} from "../types";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentEmptyState } from "./AppointmentEmptyState";
import { AppointmentList } from "./AppointmentList";
import { AppointmentSheet } from "./AppointmentSheet";
import {
  AttendAppointmentSheet,
  type AttendAppointmentSaveResult,
} from "./AttendAppointmentSheet";
import { ConsultasHeader } from "./ConsultasHeader";

export function ConsultasClient() {
  const router = useRouter();
  const { isAuthenticated, isHydrated: authHydrated } = useAuth();
  const { baby, isHydrated: babyHydrated } = useBaby();
  const {
    upcomingAppointments,
    overdueAppointments,
    attendedAppointments,
    summary,
    isLoading,
    refresh,
  } = useAppointments();
  const [isAppointmentSheetOpen, setIsAppointmentSheetOpen] = useState(false);
  const [isAttendSheetOpen, setIsAttendSheetOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<PediatricAppointment | null>(null);
  const [attendingAppointment, setAttendingAppointment] = useState<PediatricAppointment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppointmentListItem | null>(null);
  const [pendingFollowUp, setPendingFollowUp] = useState<FollowUpDraft | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingFollowUp, setIsCreatingFollowUp] = useState(false);

  useEffect(() => {
    if (authHydrated && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (authHydrated && babyHydrated && !baby) {
      router.replace("/baby");
    }
  }, [authHydrated, babyHydrated, isAuthenticated, baby, router]);

  const dataReady = authHydrated && babyHydrated;

  const allAppointmentsCount = useMemo(
    () =>
      upcomingAppointments.length +
      overdueAppointments.length +
      attendedAppointments.length,
    [
      attendedAppointments.length,
      overdueAppointments.length,
      upcomingAppointments.length,
    ]
  );

  function handleCreateOpen() {
    setEditingAppointment(null);
    setIsAppointmentSheetOpen(true);
  }

  function handleEdit(appointment: AppointmentListItem) {
    setEditingAppointment(appointment);
    setIsAppointmentSheetOpen(true);
  }

  function handleAttend(appointment: AppointmentListItem) {
    setAttendingAppointment(appointment);
    setIsAttendSheetOpen(true);
  }

  function handleAttendSaved(result: AttendAppointmentSaveResult) {
    refresh();
    if (result.followUpDraft) {
      setPendingFollowUp(result.followUpDraft);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteAppointment(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
    } catch (error) {
      console.error("[ConsultasClient] Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleCreateFollowUp() {
    if (!baby || !pendingFollowUp) {
      return;
    }

    setIsCreatingFollowUp(true);

    try {
      await saveAppointment({
        babyId: baby.id,
        doctorName: pendingFollowUp.doctorName,
        location: pendingFollowUp.location,
        reason: pendingFollowUp.reason,
        scheduledAt: pendingFollowUp.scheduledAt,
        status: "scheduled",
        preVisitNotes: pendingFollowUp.preVisitNotes,
        linkedVaccineIds: [],
      });
      setPendingFollowUp(null);
      refresh();
    } catch (error) {
      console.error("[ConsultasClient] Follow-up creation failed:", error);
    } finally {
      setIsCreatingFollowUp(false);
    }
  }

  if (!dataReady || isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !baby) {
    return null;
  }

  return (
    <>
      <main className="px-6 pt-4 pb-32 space-y-8">
        <ConsultasHeader {...summary} onCreate={handleCreateOpen} />

        {allAppointmentsCount === 0 ? (
          <AppointmentEmptyState onCreate={handleCreateOpen} />
        ) : (
          <>
            <AppointmentList
              title="Proximas consultas"
              description="Visitas futuras ja agendadas."
              appointments={upcomingAppointments}
              emptyMessage="Nenhuma consulta futura agendada."
              onEdit={handleEdit}
              onAttend={handleAttend}
              onDelete={setDeleteTarget}
            />

            <AppointmentList
              title="Atrasadas"
              description="Consultas que ficaram para tras e ainda nao foram concluidas."
              appointments={overdueAppointments}
              emptyMessage="Nenhuma consulta atrasada no momento."
              onEdit={handleEdit}
              onAttend={handleAttend}
              onDelete={setDeleteTarget}
            />

            <AppointmentList
              title="Atendidas recentes"
              description="Visitas concluidas com notas e dossie do mesmo dia."
              appointments={attendedAppointments}
              emptyMessage="Nenhuma consulta marcada como atendida."
              onEdit={handleEdit}
              onAttend={handleAttend}
              onDelete={setDeleteTarget}
            />
          </>
        )}
      </main>

      <AppointmentSheet
        babyId={baby.id}
        isOpen={isAppointmentSheetOpen}
        appointment={editingAppointment}
        onClose={() => {
          setIsAppointmentSheetOpen(false);
          setEditingAppointment(null);
        }}
        onSaved={refresh}
      />

      <AttendAppointmentSheet
        babyId={baby.id}
        appointment={attendingAppointment}
        isOpen={isAttendSheetOpen}
        onClose={() => {
          setIsAttendSheetOpen(false);
          setAttendingAppointment(null);
        }}
        onSaved={handleAttendSaved}
      />

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir consulta"
        description="Essa consulta sera removida permanentemente da agenda do bebe."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={pendingFollowUp !== null}
        onClose={() => setPendingFollowUp(null)}
        onConfirm={handleCreateFollowUp}
        title="Criar proxima consulta?"
        description={
          pendingFollowUp
            ? `Sugerimos um retorno para ${formatDate(pendingFollowUp.scheduledAt)} com ${pendingFollowUp.doctorName}.`
            : "Sugerimos criar automaticamente a proxima consulta."
        }
        confirmLabel="Criar retorno"
        cancelLabel="Agora nao"
        variant="primary"
        isLoading={isCreatingFollowUp}
      />
    </>
  );
}
