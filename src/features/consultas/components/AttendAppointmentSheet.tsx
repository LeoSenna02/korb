"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus2, Check, Link2, LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import {
  getAppointmentLinkSuggestions,
  markAppointmentAsAttended,
} from "@/lib/db/repositories/appointment";
import { formatDate } from "@/lib/utils/format";
import type {
  AppointmentLinkSuggestions,
  FollowUpDraft,
  PediatricAppointment,
} from "../types";
import {
  buildEmptyAttendFormValues,
  buildFollowUpDraft,
  parseFollowUpIntervalDays,
} from "../utils";

export interface AttendAppointmentSaveResult {
  followUpDraft?: FollowUpDraft;
}

interface AttendAppointmentSheetProps {
  babyId: string;
  appointment: PediatricAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (result: AttendAppointmentSaveResult) => void;
}

function VaccineSuggestionItem({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
        checked
          ? "border-[#8EAF96]/30 bg-[#8EAF96]/10"
          : "border-surface-variant/20 bg-surface-container-high"
      }`}
    >
      <span className="font-data text-sm text-text-primary">{label}</span>
    </button>
  );
}

export function AttendAppointmentSheet({
  babyId,
  appointment,
  isOpen,
  onClose,
  onSaved,
}: AttendAppointmentSheetProps) {
  const initialValues = useMemo(
    () => buildEmptyAttendFormValues(appointment),
    [appointment]
  );
  const [postVisitNotes, setPostVisitNotes] = useState(initialValues.postVisitNotes);
  const [followUpIntervalDays, setFollowUpIntervalDays] = useState(
    initialValues.followUpIntervalDays
  );
  const [followUpInstructions, setFollowUpInstructions] = useState(
    initialValues.followUpInstructions
  );
  const [linkedGrowthId, setLinkedGrowthId] = useState(initialValues.linkedGrowthId);
  const [linkedVaccineIds, setLinkedVaccineIds] = useState(initialValues.linkedVaccineIds);
  const [suggestions, setSuggestions] = useState<AppointmentLinkSuggestions>({
    growthRecords: [],
    vaccineRecords: [],
  });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPostVisitNotes(initialValues.postVisitNotes);
    setFollowUpIntervalDays(initialValues.followUpIntervalDays);
    setFollowUpInstructions(initialValues.followUpInstructions);
    setLinkedGrowthId(initialValues.linkedGrowthId);
    setLinkedVaccineIds(initialValues.linkedVaccineIds);
  }, [initialValues, isOpen]);

  useEffect(() => {
    if (!isOpen || !appointment) {
      return;
    }

    const currentAppointment = appointment;
    let cancelled = false;

    async function loadSuggestions() {
      setIsLoadingSuggestions(true);

      try {
        const result = await getAppointmentLinkSuggestions(
          babyId,
          currentAppointment.scheduledAt
        );

        if (!cancelled) {
          setSuggestions(result);
          if (!initialValues.linkedGrowthId && result.growthRecords.length === 1) {
            setLinkedGrowthId(result.growthRecords[0].id);
          }
          if (
            initialValues.linkedVaccineIds.length === 0 &&
            result.vaccineRecords.length > 0
          ) {
            setLinkedVaccineIds(result.vaccineRecords.map((record) => record.id));
          }
        }
      } catch (error) {
        console.error("[AttendAppointmentSheet] Suggestion load failed:", error);
        if (!cancelled) {
          setSuggestions({ growthRecords: [], vaccineRecords: [] });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSuggestions(false);
        }
      }
    }

    loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [
    appointment,
    babyId,
    initialValues.linkedGrowthId,
    initialValues.linkedVaccineIds.length,
    isOpen,
  ]);

  function toggleVaccineSelection(vaccineId: string) {
    setLinkedVaccineIds((current) =>
      current.includes(vaccineId)
        ? current.filter((id) => id !== vaccineId)
        : [...current, vaccineId]
    );
  }

  async function handleSave() {
    if (!appointment) {
      return;
    }

    const parsedFollowUpIntervalDays = parseFollowUpIntervalDays(followUpIntervalDays);
    const shouldSuggestFollowUp =
      appointment.status !== "attended" && parsedFollowUpIntervalDays != null;

    setIsSaving(true);

    try {
      await markAppointmentAsAttended(appointment.id, {
        postVisitNotes: postVisitNotes.trim() || undefined,
        followUpIntervalDays: parsedFollowUpIntervalDays,
        followUpInstructions: followUpInstructions.trim() || undefined,
        linkedGrowthId,
        linkedVaccineIds,
      });

      onSaved({
        followUpDraft:
          shouldSuggestFollowUp
            ? buildFollowUpDraft(
                {
                  ...appointment,
                  followUpInstructions: followUpInstructions.trim() || undefined,
                },
                parsedFollowUpIntervalDays
              )
            : undefined,
      });
      onClose();
    } catch (error) {
      console.error("[AttendAppointmentSheet] Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={appointment?.status === "attended" ? "Editar conclusao" : "Concluir consulta"}
      subtitle="DOSSIE DA VISITA"
    >
      <div className="space-y-5 pb-8">
        <div className="rounded-2xl bg-surface-container-high px-4 py-4">
          <p className="font-data text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            Consulta
          </p>
          <p className="font-display text-lg text-text-primary mt-2">
            {appointment?.doctorName}
          </p>
          <p className="font-data text-sm text-text-secondary mt-1">
            {appointment ? formatDate(appointment.scheduledAt) : ""}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-data text-xs text-text-secondary uppercase tracking-wider">
            NOTAS DEPOIS DA CONSULTA
          </label>
          <textarea
            value={postVisitNotes}
            onChange={(event) => setPostVisitNotes(event.target.value)}
            rows={4}
            placeholder="Resumo, orientacoes, medicacoes prescritas ou qualquer observacao relevante."
            className="w-full rounded-2xl bg-surface-container-high text-text-primary font-data text-sm p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch">
          <Input
            label="RETORNO EM DIAS"
            type="number"
            min="1"
            value={followUpIntervalDays}
            onChange={(event) => setFollowUpIntervalDays(event.target.value)}
            placeholder="15"
            className="bg-surface-container-high border-none h-14"
          />

          <div className="rounded-2xl border border-[#88AFC7]/15 bg-[#88AFC7]/8 px-4 py-4 sm:h-full">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#88AFC7]/12 text-[#88AFC7]">
                <CalendarPlus2 className="h-4 w-4" strokeWidth={2} />
              </div>

              <div className="min-w-0">
                <p className="font-data text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                  Automacao
                </p>
                <p className="font-data text-sm text-text-primary mt-2 leading-relaxed">
                  Ao salvar, o app sugere a proxima consulta com a data ja preenchida.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-data text-xs text-text-secondary uppercase tracking-wider">
            INSTRUCOES DE RETORNO
          </label>
          <textarea
            value={followUpInstructions}
            onChange={(event) => setFollowUpInstructions(event.target.value)}
            rows={3}
            placeholder="Ex: voltar com exames ou retornar antes se a febre persistir."
            className="w-full rounded-2xl bg-surface-container-high text-text-primary font-data text-sm p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#8EAF96]" strokeWidth={1.8} />
            <h3 className="font-display text-lg text-text-primary">
              Vincular dados da visita
            </h3>
          </div>

          {isLoadingSuggestions ? (
            <div className="rounded-2xl bg-surface-container-high p-4 flex items-center gap-3 text-text-secondary">
              <LoaderCircle className="w-4 h-4 animate-spin" />
              <span className="font-data text-sm">
                Buscando registros do mesmo dia...
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="font-data text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                  Crescimento
                </p>
                {suggestions.growthRecords.length === 0 ? (
                  <div className="rounded-2xl bg-surface-container-high p-4">
                    <span className="font-data text-sm text-text-disabled">
                      Nenhuma medicao encontrada na mesma data.
                    </span>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => setLinkedGrowthId(undefined)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                        !linkedGrowthId
                          ? "border-[#88AFC7]/30 bg-[#88AFC7]/10"
                          : "border-surface-variant/20 bg-surface-container-high"
                      }`}
                    >
                      <span className="font-data text-sm text-text-primary">
                        Nao vincular medicao
                      </span>
                    </button>

                    {suggestions.growthRecords.map((record) => (
                      <button
                        key={record.id}
                        type="button"
                        onClick={() => setLinkedGrowthId(record.id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                          linkedGrowthId === record.id
                            ? "border-[#88AFC7]/30 bg-[#88AFC7]/10"
                            : "border-surface-variant/20 bg-surface-container-high"
                        }`}
                      >
                        <span className="font-data text-sm text-text-primary">
                          {record.weightKg != null
                            ? `${record.weightKg} kg`
                            : "Sem peso"}
                          {" · "}
                          {record.heightCm != null
                            ? `${record.heightCm} cm`
                            : "Sem altura"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-data text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                  Vacinas aplicadas
                </p>
                {suggestions.vaccineRecords.length === 0 ? (
                  <div className="rounded-2xl bg-surface-container-high p-4">
                    <span className="font-data text-sm text-text-disabled">
                      Nenhuma vacina aplicada encontrada nessa data.
                    </span>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {suggestions.vaccineRecords.map((record) => (
                      <VaccineSuggestionItem
                        key={record.id}
                        label={`${record.name}${record.doseLabel ? ` · ${record.doseLabel}` : ""}`}
                        checked={linkedVaccineIds.includes(record.id)}
                        onToggle={() => toggleVaccineSelection(record.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-16 bg-primary hover:bg-primary/90 active:scale-[0.98] text-on-primary font-display font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-primary/10 disabled:opacity-50"
        >
          <Check className="w-6 h-6" strokeWidth={2.5} />
          {isSaving ? "Salvando..." : "Salvar conclusao"}
        </button>
      </div>
    </Sheet>
  );
}
