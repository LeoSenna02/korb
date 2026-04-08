"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { DateInput } from "@/components/ui/DateInput";
import { TimeInput } from "@/components/ui/TimeInput";
import type { SymptomEpisode } from "@/lib/db/types";
import { resolveSymptomEpisode } from "@/lib/sync/repositories/symptom";
import {
  combineDateAndTimeToIso,
  getLocalDateKey,
  getLocalTimeValue,
} from "@/lib/utils/format";
import { getSymptomLabel } from "../constants";
import { symptomEpisodeInputSchema } from "../validation";

interface ResolveSymptomEpisodeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  episode: SymptomEpisode | null;
  onResolved: () => void;
}

function getDefaultResolutionValues() {
  const now = new Date().toISOString();

  return {
    resolvedDate: getLocalDateKey(now),
    resolvedTime: getLocalTimeValue(now),
    resolutionNotes: "",
  };
}

function getIssueMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Nao foi possivel resolver o episodio.";
}

export function ResolveSymptomEpisodeSheet({
  isOpen,
  onClose,
  episode,
  onResolved,
}: ResolveSymptomEpisodeSheetProps) {
  const [resolvedDate, setResolvedDate] = useState(
    getDefaultResolutionValues().resolvedDate
  );
  const [resolvedTime, setResolvedTime] = useState(
    getDefaultResolutionValues().resolvedTime
  );
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaults = getDefaultResolutionValues();
      setResolvedDate(defaults.resolvedDate);
      setResolvedTime(defaults.resolvedTime);
      setResolutionNotes("");
      setError(null);
    }
  }, [isOpen]);

  async function handleResolve() {
    if (!episode) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const resolvedAt = combineDateAndTimeToIso(resolvedDate, resolvedTime);
      const parsed = symptomEpisodeInputSchema.safeParse({
        ...episode,
        status: "resolved" as const,
        resolvedAt,
        resolutionNotes,
      });

      if (!parsed.success) {
        setError(
          parsed.error.issues[0]?.message ?? "Revise os dados de resolucao."
        );
        return;
      }

      await resolveSymptomEpisode(episode.id, {
        resolvedAt,
        resolutionNotes,
      });

      onResolved();
      onClose();
    } catch (resolveError) {
      setError(getIssueMessage(resolveError));
    } finally {
      setIsSaving(false);
    }
  }

  const pickerKey = episode?.id ?? "resolve";

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Encerrar acompanhamento"
      subtitle="FINALIZE ESTE EPISODIO"
    >
      <div className="space-y-6 pb-8">
        <div className="rounded-3xl border border-[#8EAF96]/20 bg-[#8EAF96]/10 p-4">
          <p className="font-display text-base text-text-primary">
            {episode?.symptoms.map(getSymptomLabel).join(" • ") ?? "Episodio"}
          </p>
          <p className="mt-1 font-data text-xs text-text-secondary">
            Registre quando esse acompanhamento foi considerado resolvido.
          </p>
        </div>

        <DateInput
          key={`resolve-date-${pickerKey}`}
          label="Data de resolucao"
          initialValue={resolvedDate}
          onChange={setResolvedDate}
        />

        <TimeInput
          key={`resolve-time-${pickerKey}`}
          label="Horario de resolucao"
          initialValue={resolvedTime}
          onChange={setResolvedTime}
        />

        <div className="space-y-2">
          <label className="font-data text-xs uppercase tracking-wider text-text-secondary">
            Nota final (opcional)
          </label>
          <textarea
            value={resolutionNotes}
            onChange={(event) => setResolutionNotes(event.target.value)}
            rows={4}
            placeholder="Ex.: bebe voltou a mamar bem e a temperatura normalizou."
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
          onClick={handleResolve}
          disabled={isSaving}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary-container font-display text-base font-semibold text-on-primary-container transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-60"
        >
          <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
          {isSaving ? "Encerrando..." : "Marcar como resolvido"}
        </button>
      </div>
    </Sheet>
  );
}
