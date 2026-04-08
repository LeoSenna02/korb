import { Clock3, FileText, Pill, Thermometer, Trash2 } from "lucide-react";
import type { SymptomEpisode } from "@/lib/db/types";
import { formatDate, formatTime } from "@/lib/utils/format";
import { getSymptomLabel, SYMPTOM_SEVERITY_META } from "../constants";

interface SymptomEpisodeCardProps {
  episode: SymptomEpisode;
  variant: "active" | "resolved";
  onEdit?: (episode: SymptomEpisode) => void;
  onResolve?: (episode: SymptomEpisode) => void;
  onDelete?: (episode: SymptomEpisode) => void;
  onGoToConsultas?: () => void;
}

function formatSymptomList(symptoms: string[]): string {
  return symptoms.map(getSymptomLabel).join(" • ");
}

export function SymptomEpisodeCard({
  episode,
  variant,
  onEdit,
  onResolve,
  onDelete,
  onGoToConsultas,
}: SymptomEpisodeCardProps) {
  const severityMeta = SYMPTOM_SEVERITY_META[episode.severity];
  const isActive = variant === "active";
  const referenceDate = isActive
    ? episode.startedAt
    : episode.resolvedAt ?? episode.updatedAt;

  return (
    <article className="rounded-[28px] border border-surface-variant/20 bg-surface-container-low p-5">
      <div className="mb-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 font-data text-[10px] uppercase tracking-[0.18em] ${severityMeta.surfaceClassName} ${severityMeta.accentClassName}`}
          >
            {severityMeta.label}
          </span>
          <span className="inline-flex items-center rounded-full bg-surface-variant/20 px-3 py-1 font-data text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            {isActive ? "Em acompanhamento" : "Resolvido"}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold text-text-primary">
          {formatSymptomList(episode.symptoms)}
        </h3>
        <p className="mt-1 font-data text-xs text-text-secondary">
          {severityMeta.description}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {episode.temperatureC ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#CD8282]/10 px-3 py-1.5 font-data text-[11px] text-[#CD8282]">
            <Thermometer className="h-3.5 w-3.5" strokeWidth={2} />
            {episode.temperatureC.toFixed(1)} C
          </span>
        ) : null}

        {episode.medication ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-variant/20 px-3 py-1.5 font-data text-[11px] text-text-secondary">
            <Pill className="h-3.5 w-3.5" strokeWidth={2} />
            {episode.medication}
          </span>
        ) : null}

        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-variant/20 px-3 py-1.5 font-data text-[11px] text-text-secondary">
          <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
          {formatDate(referenceDate)} • {formatTime(referenceDate)}
        </span>
      </div>

      {episode.notes ? (
        <div className="mb-3 rounded-2xl bg-surface-variant/10 p-3.5">
          <div className="mb-1 flex items-center gap-2 text-text-secondary">
            <FileText className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="font-data text-[10px] uppercase tracking-[0.16em]">
              Observacoes
            </span>
          </div>
          <p className="font-data text-sm leading-6 text-text-primary">
            {episode.notes}
          </p>
        </div>
      ) : null}

      {!isActive && episode.resolutionNotes ? (
        <div className="mb-4 rounded-2xl bg-[#8EAF96]/10 p-3.5">
          <span className="font-data text-[10px] uppercase tracking-[0.16em] text-[#8EAF96]">
            Encerramento
          </span>
          <p className="mt-1 font-data text-sm leading-6 text-text-primary">
            {episode.resolutionNotes}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {isActive ? (
          <>
            <button
              type="button"
              onClick={() => onEdit?.(episode)}
              className="flex-1 rounded-2xl border border-surface-variant/20 bg-surface-variant/10 px-4 py-3 font-display text-sm text-text-primary transition-colors hover:bg-surface-variant/20"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onGoToConsultas?.()}
              className="flex-1 rounded-2xl border border-[#88AFC7]/20 bg-[#88AFC7]/10 px-4 py-3 font-display text-sm text-[#88AFC7] transition-colors hover:bg-[#88AFC7]/15"
            >
              Ir para Consultas
            </button>
            <button
              type="button"
              onClick={() => onResolve?.(episode)}
              className="flex-1 rounded-2xl bg-primary-container px-4 py-3 font-display text-sm text-on-primary-container transition-colors hover:bg-primary"
            >
              Marcar como resolvido
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(episode)}
              className="inline-flex basis-full items-center justify-center gap-2 rounded-2xl border border-[#CD8282]/20 bg-[#CD8282]/10 px-4 py-3 font-display text-sm text-[#CD8282] transition-colors hover:bg-[#CD8282]/15"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
              Excluir registro
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onDelete?.(episode)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#CD8282]/20 bg-[#CD8282]/10 px-4 py-3 font-display text-sm text-[#CD8282] transition-colors hover:bg-[#CD8282]/15"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            Excluir registro
          </button>
        )}
      </div>
    </article>
  );
}
