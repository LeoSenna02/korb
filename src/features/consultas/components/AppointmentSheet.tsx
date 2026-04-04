"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { DateInput, TimeInput } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import {
  saveAppointment,
  updateAppointment,
} from "@/lib/db/repositories/appointment";
import type { PediatricAppointment } from "../types";
import {
  buildAppointmentFormValues,
  buildScheduledAtFromForm,
} from "../utils";

interface AppointmentSheetProps {
  babyId: string;
  isOpen: boolean;
  appointment?: PediatricAppointment | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AppointmentSheet({
  babyId,
  isOpen,
  appointment,
  onClose,
  onSaved,
}: AppointmentSheetProps) {
  const initialValues = useMemo(
    () => buildAppointmentFormValues(appointment),
    [appointment]
  );
  const [doctorName, setDoctorName] = useState(initialValues.doctorName);
  const [location, setLocation] = useState(initialValues.location);
  const [reason, setReason] = useState(initialValues.reason);
  const [scheduledDate, setScheduledDate] = useState(initialValues.scheduledDate);
  const [scheduledTime, setScheduledTime] = useState(initialValues.scheduledTime);
  const [preVisitNotes, setPreVisitNotes] = useState(initialValues.preVisitNotes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDoctorName(initialValues.doctorName);
    setLocation(initialValues.location);
    setReason(initialValues.reason);
    setScheduledDate(initialValues.scheduledDate);
    setScheduledTime(initialValues.scheduledTime);
    setPreVisitNotes(initialValues.preVisitNotes);
  }, [initialValues, isOpen]);

  async function handleSave() {
    if (!doctorName.trim() || !location.trim() || !reason.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        doctorName: doctorName.trim(),
        location: location.trim(),
        reason: reason.trim(),
        scheduledAt: buildScheduledAtFromForm({
          doctorName,
          location,
          reason,
          scheduledDate,
          scheduledTime,
          preVisitNotes,
        }),
        preVisitNotes: preVisitNotes.trim() || undefined,
      };

      if (appointment) {
        await updateAppointment(appointment.id, payload);
      } else {
        await saveAppointment({
          babyId,
          ...payload,
          status: "scheduled",
          linkedVaccineIds: [],
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("[AppointmentSheet] Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }

  const canSave =
    doctorName.trim().length > 0 &&
    location.trim().length > 0 &&
    reason.trim().length > 0 &&
    scheduledDate.length > 0 &&
    scheduledTime.length > 0;
  const dateInputKey = `${appointment?.id ?? "new"}-${initialValues.scheduledDate}-${isOpen ? "open" : "closed"}`;
  const timeInputKey = `${appointment?.id ?? "new"}-${initialValues.scheduledTime}-${isOpen ? "open" : "closed"}`;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={appointment ? "Editar consulta" : "Nova consulta"}
      subtitle="AGENDA PEDIATRICA"
    >
      <div className="space-y-5 pb-8">
        <Input
          label="PEDIATRA"
          value={doctorName}
          onChange={(event) => setDoctorName(event.target.value)}
          placeholder="Ex: Dra. Mariana Costa"
          className="bg-surface-container-high border-none h-14"
        />

        <Input
          label="LOCAL"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Ex: Clinica Viver"
          className="bg-surface-container-high border-none h-14"
        />

        <Input
          label="MOTIVO"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ex: Revisao de 4 meses"
          className="bg-surface-container-high border-none h-14"
        />

        <div className="grid gap-4">
          <DateInput
            key={dateInputKey}
            label="DATA DA CONSULTA"
            name="appointmentDate"
            required
            initialValue={initialValues.scheduledDate}
            onChange={setScheduledDate}
          />

          <TimeInput
            key={timeInputKey}
            label="HORA DA CONSULTA"
            name="appointmentTime"
            initialValue={initialValues.scheduledTime}
            onChange={setScheduledTime}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-data text-xs text-text-secondary uppercase tracking-wider">
            NOTAS ANTES DA CONSULTA
          </label>
          <textarea
            value={preVisitNotes}
            onChange={(event) => setPreVisitNotes(event.target.value)}
            rows={4}
            placeholder="Sintomas, perguntas, remedios em uso ou qualquer observacao para levar ao pediatra."
            className="w-full rounded-2xl bg-surface-container-high text-text-primary font-data text-sm p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !canSave}
          className="w-full h-16 bg-primary hover:bg-primary/90 active:scale-[0.98] text-on-primary font-display font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-primary/10 disabled:opacity-50"
        >
          <Check className="w-6 h-6" strokeWidth={2.5} />
          {isSaving ? "Salvando..." : appointment ? "Salvar alteracoes" : "Criar consulta"}
        </button>
      </div>
    </Sheet>
  );
}
