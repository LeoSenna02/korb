"use client";

import { Input } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import type { PediatricAppointment } from "../types";
import {
  useAttendAppointmentForm,
  type AttendAppointmentSaveResult,
} from "../hooks/useAttendAppointmentForm";
import { AttendAppointmentSummaryCard } from "./AttendAppointmentSummaryCard";
import { AttendAutomationCard } from "./AttendAutomationCard";
import { AttendMeasurementsSection } from "./AttendMeasurementsSection";
import { AttendSaveButton } from "./AttendSaveButton";
import { AttendTextareaField } from "./AttendTextareaField";
import { AttendVaccinesSection } from "./AttendVaccinesSection";
import { AttendVisitSectionHeader } from "./AttendVisitSectionHeader";

export type { AttendAppointmentSaveResult } from "../hooks/useAttendAppointmentForm";

interface AttendAppointmentSheetProps {
  babyId: string;
  appointment: PediatricAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (result: AttendAppointmentSaveResult) => void;
}

export function AttendAppointmentSheet({
  babyId,
  appointment,
  isOpen,
  onClose,
  onSaved,
}: AttendAppointmentSheetProps) {
  const form = useAttendAppointmentForm({
    babyId,
    appointment,
    isOpen,
    onClose,
    onSaved,
  });

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={appointment?.status === "attended" ? "Editar conclusao" : "Concluir consulta"}
      subtitle="DOSSIE DA VISITA"
    >
      <div className="space-y-5 pb-8">
        <AttendAppointmentSummaryCard
          doctorName={appointment?.doctorName}
          scheduledAt={appointment?.scheduledAt}
        />

        <AttendTextareaField
          label="NOTAS DEPOIS DA CONSULTA"
          value={form.postVisitNotes}
          rows={4}
          placeholder="Resumo, orientacoes, medicacoes prescritas ou qualquer observacao relevante."
          onChange={form.setPostVisitNotes}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch">
          <Input
            label="RETORNO EM DIAS"
            type="number"
            min="1"
            value={form.followUpIntervalDays}
            onChange={(event) => form.setFollowUpIntervalDays(event.target.value)}
            placeholder="15"
            className="bg-surface-container-high border-none h-14"
          />
          <AttendAutomationCard />
        </div>

        <AttendTextareaField
          label="INSTRUCOES DE RETORNO"
          value={form.followUpInstructions}
          rows={3}
          placeholder="Ex: voltar com exames ou retornar antes se a febre persistir."
          onChange={form.setFollowUpInstructions}
        />

        <section className="space-y-4">
          <AttendVisitSectionHeader title="Dados da visita" />
          <AttendMeasurementsSection
            enabled={form.measurementsEnabled}
            weight={form.weight}
            height={form.height}
            cephalicPerimeter={form.cephalicPerimeter}
            error={form.formError}
            onToggle={form.toggleMeasurements}
            onWeightChange={form.handleWeightChange}
            onWeightBlur={form.handleWeightBlur}
            onHeightChange={form.handleHeightChange}
            onCephalicPerimeterChange={form.handleCephalicPerimeterChange}
          />
          <AttendVaccinesSection
            vaccineRecords={form.suggestions.vaccineRecords}
            linkedVaccineIds={form.linkedVaccineIds}
            isLoading={form.isLoadingSuggestions}
            onToggleVaccine={form.toggleVaccineSelection}
          />
        </section>

        {!form.measurementsEnabled && form.formError ? (
          <p className="font-data text-xs leading-relaxed text-[#CD8282]">
            {form.formError}
          </p>
        ) : null}

        <AttendSaveButton
          isSaving={form.isSaving}
          disabled={form.isSaveDisabled}
          onClick={() => {
            void form.handleSave();
          }}
        />
      </div>
    </Sheet>
  );
}
