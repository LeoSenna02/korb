"use client";

import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { DateInput } from "@/components/ui/DateInput";
import { TimeInput } from "@/components/ui/TimeInput";
import type { SymptomEpisode } from "@/lib/db/types";
import {
  saveSymptomEpisode,
  updateSymptomEpisode,
} from "@/lib/sync/repositories/symptom";
import {
  combineDateAndTimeToIso,
  getLocalDateKey,
  getLocalTimeValue,
} from "@/lib/utils/format";
import {
  DEFAULT_SYMPTOM_SEVERITY,
  getSymptomLabel,
  getSymptomOptionId,
  SYMPTOM_PRESET_OPTIONS,
  SYMPTOM_SEVERITY_META,
} from "../constants";
import { symptomEpisodeInputSchema } from "../validation";
import type { SymptomEpisodeFormValues } from "../types";

interface SymptomEpisodeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string;
  episode?: SymptomEpisode | null;
  onSaved: () => void;
}

function getDefaultFormValues(
  episode?: SymptomEpisode | null
): SymptomEpisodeFormValues {
  const now = new Date().toISOString();
  const selectedSymptoms = episode
    ? episode.symptoms
        .map((symptom) => getSymptomOptionId(symptom))
        .filter((symptom): symptom is string => Boolean(symptom))
    : [];
  const customSymptoms = episode
    ? episode.symptoms.filter((symptom) => getSymptomOptionId(symptom) === null)
    : [];

  return {
    selectedSymptoms,
    customSymptom: customSymptoms.join(", "),
    severity: episode?.severity ?? DEFAULT_SYMPTOM_SEVERITY,
    startDate: getLocalDateKey(episode?.startedAt ?? now),
    startTime: getLocalTimeValue(episode?.startedAt ?? now),
    temperatureC:
      episode?.temperatureC != null ? String(episode.temperatureC) : "",
    medication: episode?.medication ?? "",
    notes: episode?.notes ?? "",
  };
}

function normalizeCustomSymptoms(value: string): string[] {
  return value
    .split(",")
    .map((symptom) => symptom.trim())
    .filter(Boolean);
}

function getIssueMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Nao foi possivel salvar o episodio.";
}

export function SymptomEpisodeSheet({
  isOpen,
  onClose,
  babyId,
  episode,
  onSaved,
}: SymptomEpisodeSheetProps) {
  const [formValues, setFormValues] = useState<SymptomEpisodeFormValues>(
    getDefaultFormValues(episode)
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormValues(getDefaultFormValues(episode));
      setError(null);
    }
  }, [episode, isOpen]);

  const timePickerKey = episode?.id ?? "new";
  const allSymptoms = Array.from(
    new Set([
      ...formValues.selectedSymptoms.map(getSymptomLabel),
      ...normalizeCustomSymptoms(formValues.customSymptom),
    ])
  );

  function updateField<Key extends keyof SymptomEpisodeFormValues>(
    field: Key,
    value: SymptomEpisodeFormValues[Key]
  ) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleToggleSymptom(symptomId: string) {
    setFormValues((current) => {
      const exists = current.selectedSymptoms.includes(symptomId);

      return {
        ...current,
        selectedSymptoms: exists
          ? current.selectedSymptoms.filter((symptom) => symptom !== symptomId)
          : [...current.selectedSymptoms, symptomId],
      };
    });
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        babyId,
        symptoms: allSymptoms,
        severity: formValues.severity,
        status: "active" as const,
        startedAt: combineDateAndTimeToIso(
          formValues.startDate,
          formValues.startTime
        ),
        temperatureC: formValues.temperatureC
          ? Number(formValues.temperatureC.replace(",", "."))
          : undefined,
        medication: formValues.medication,
        notes: formValues.notes,
      };

      const parsed = symptomEpisodeInputSchema.safeParse(payload);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Revise os campos do formulario.");
        return;
      }

      if (episode) {
        await updateSymptomEpisode(episode.id, payload);
      } else {
        await saveSymptomEpisode(payload);
      }

      onSaved();
      onClose();
    } catch (saveError) {
      setError(getIssueMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={episode ? "Editar episodio" : "Novo episodio"}
      subtitle={episode ? "Atualize o acompanhamento atual" : "REGISTRO DE SINTOMAS"}
    >
      <div className="space-y-6 pb-8">
        <div className="space-y-3">
          <div>
            <label className="font-data text-xs uppercase tracking-wider text-text-secondary">
              Sintomas
            </label>
            <p className="mt-1 font-data text-xs text-text-disabled">
              Selecione os sintomas observados neste episodio.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SYMPTOM_PRESET_OPTIONS.map((option) => {
              const isSelected = formValues.selectedSymptoms.includes(option.id);

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleToggleSymptom(option.id)}
                  className={`rounded-full px-4 py-2.5 font-display text-sm transition-all ${
                    isSelected
                      ? "bg-[#CD8282]/15 text-[#CD8282] ring-1 ring-[#CD8282]/30"
                      : "bg-surface-container text-text-secondary hover:bg-surface-variant/30 hover:text-text-primary"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-data text-xs uppercase tracking-wider text-text-secondary">
            Outro sintoma
          </label>
          <input
            value={formValues.customSymptom}
            onChange={(event) => updateField("customSymptom", event.target.value)}
            placeholder="Ex.: irritacao, falta de apetite"
            className="h-12 w-full rounded-2xl border border-surface-variant/20 bg-surface-container px-4 font-data text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-primary/40"
          />
          <p className="font-data text-[11px] text-text-disabled">
            Separe mais de um item por virgula.
          </p>
        </div>

        <div className="space-y-3">
          <label className="font-data text-xs uppercase tracking-wider text-text-secondary">
            Gravidade
          </label>
          <div className="grid grid-cols-2 gap-3 min-[420px]:grid-cols-3">
            {(Object.entries(SYMPTOM_SEVERITY_META) as Array<
              [
                typeof formValues.severity,
                (typeof SYMPTOM_SEVERITY_META)[typeof formValues.severity]
              ]
            >).map(([severity, meta], index) => {
              const isSelected = formValues.severity === severity;

              return (
                <button
                  key={severity}
                  type="button"
                  onClick={() => updateField("severity", severity)}
                  className={`min-h-[112px] rounded-3xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-current bg-surface-container-high"
                      : "border-surface-variant/20 bg-surface-container"
                  } ${index === 2 ? "col-span-2 min-[420px]:col-span-1" : ""} ${meta.accentClassName}`}
                >
                  <span className="font-display text-sm font-medium">
                    {meta.label}
                  </span>
                  <p className="mt-1 font-data text-[11px] leading-5 text-text-secondary text-pretty">
                    {meta.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4">
          <DateInput
            key={`date-${timePickerKey}`}
            label="Quando comecou?"
            initialValue={formValues.startDate}
            onChange={(value) => updateField("startDate", value)}
          />
          <TimeInput
            key={`time-${timePickerKey}`}
            label="Horario de inicio"
            initialValue={formValues.startTime}
            onChange={(value) => updateField("startTime", value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="font-data text-xs uppercase tracking-wider text-text-secondary">
              Temperatura (opcional)
            </label>
            <input
              value={formValues.temperatureC}
              onChange={(event) => updateField("temperatureC", event.target.value)}
              inputMode="decimal"
              placeholder="Ex.: 38,2"
              className="h-12 w-full rounded-2xl border border-surface-variant/20 bg-surface-container px-4 font-data text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-primary/40"
            />
          </div>

          <div className="space-y-2">
            <label className="font-data text-xs uppercase tracking-wider text-text-secondary">
              Medicacao (opcional)
            </label>
            <input
              value={formValues.medication}
              onChange={(event) => updateField("medication", event.target.value)}
              placeholder="Ex.: Paracetamol 4h"
              className="h-12 w-full rounded-2xl border border-surface-variant/20 bg-surface-container px-4 font-data text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-primary/40"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-data text-xs uppercase tracking-wider text-text-secondary">
            Observacoes
          </label>
          <textarea
            value={formValues.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={4}
            placeholder="Ex.: ficou mais irritado no fim da tarde ou dormiu pior que o normal."
            className="w-full resize-none rounded-3xl border border-surface-variant/20 bg-surface-container px-4 py-3 font-data text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-primary/40"
          />
        </div>

        {error ? (
          <div className="rounded-2xl bg-[#CD8282]/10 px-4 py-3 font-data text-sm text-[#CD8282]">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary-container font-display text-base font-semibold text-on-primary-container transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-60"
        >
          {episode ? (
            <Check className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Plus className="h-5 w-5" strokeWidth={2} />
          )}
          {isSaving ? "Salvando..." : episode ? "Salvar alteracoes" : "Criar episodio"}
        </button>
      </div>
    </Sheet>
  );
}
