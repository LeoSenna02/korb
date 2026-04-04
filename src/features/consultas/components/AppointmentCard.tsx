import {
  CalendarDays,
  Clock3,
  FilePenLine,
  MapPin,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils/format";
import type { AppointmentListItem } from "../types";

interface AppointmentCardProps {
  appointment: AppointmentListItem;
  onEdit: (appointment: AppointmentListItem) => void;
  onAttend: (appointment: AppointmentListItem) => void;
  onDelete: (appointment: AppointmentListItem) => void;
}

function StatusBadge({ status }: { status: AppointmentListItem["displayStatus"] }) {
  const statusMap = {
    scheduled: {
      label: "Agendada",
      className: "bg-[#88AFC7]/10 text-[#88AFC7]",
    },
    overdue: {
      label: "Atrasada",
      className: "bg-[#D2B59D]/15 text-[#D2B59D]",
    },
    attended: {
      label: "Atendida",
      className: "bg-[#8EAF96]/10 text-[#8EAF96]",
    },
  } as const;

  return (
    <span
      className={`rounded-full px-3 py-1 font-data text-[10px] uppercase tracking-[0.18em] ${statusMap[status].className}`}
    >
      {statusMap[status].label}
    </span>
  );
}

function buildDossierLabel(appointment: AppointmentListItem): string | null {
  const parts: string[] = [];

  if (appointment.linkedGrowthId) {
    parts.push("crescimento");
  }

  if (appointment.linkedVaccineIds.length > 0) {
    parts.push(
      appointment.linkedVaccineIds.length === 1
        ? "1 vacina"
        : `${appointment.linkedVaccineIds.length} vacinas`
    );
  }

  return parts.length > 0 ? `Dossie: ${parts.join(" + ")}` : null;
}

export function AppointmentCard({
  appointment,
  onEdit,
  onAttend,
  onDelete,
}: AppointmentCardProps) {
  const dossierLabel = buildDossierLabel(appointment);
  const primaryActionLabel =
    appointment.displayStatus === "attended"
      ? "Editar conclusao"
      : "Marcar como atendida";
  const editLabel =
    appointment.displayStatus === "attended" ? "Editar detalhes" : "Editar agenda";

  return (
    <article className="rounded-[28px] border border-surface-variant/20 bg-surface-container-low p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-display text-xl text-text-primary font-semibold">
              {appointment.doctorName}
            </h3>
            <StatusBadge status={appointment.displayStatus} />
          </div>

          <p className="font-data text-sm text-text-secondary mt-2">
            {appointment.reason}
          </p>
        </div>

        {appointment.displayStatus === "attended" ? (
          <div className="w-10 h-10 rounded-2xl bg-[#8EAF96]/10 text-[#8EAF96] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" strokeWidth={2} />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-[#88AFC7]/10 text-[#88AFC7] flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="grid gap-3 mt-5">
        <div className="flex items-center gap-2 text-text-secondary">
          <CalendarDays className="w-4 h-4" strokeWidth={1.8} />
          <span className="font-data text-xs">
            {formatDate(appointment.scheduledAt)}
          </span>
          <Clock3 className="w-4 h-4 ml-2" strokeWidth={1.8} />
          <span className="font-data text-xs">
            {formatTime(appointment.scheduledAt)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-text-secondary">
          <MapPin className="w-4 h-4" strokeWidth={1.8} />
          <span className="font-data text-xs">{appointment.location}</span>
        </div>

        {appointment.preVisitNotes && (
          <p className="font-data text-xs text-text-secondary leading-relaxed">
            <span className="text-text-primary">Antes:</span>{" "}
            {appointment.preVisitNotes}
          </p>
        )}

        {appointment.postVisitNotes && (
          <p className="font-data text-xs text-text-secondary leading-relaxed">
            <span className="text-text-primary">Depois:</span>{" "}
            {appointment.postVisitNotes}
          </p>
        )}

        {appointment.followUpIntervalDays != null && (
          <p className="font-data text-xs text-[#88AFC7] leading-relaxed">
            Retorno sugerido em {appointment.followUpIntervalDays} dia
            {appointment.followUpIntervalDays === 1 ? "" : "s"}.
          </p>
        )}

        {dossierLabel && (
          <p className="font-data text-xs text-[#8EAF96] leading-relaxed">
            {dossierLabel}
          </p>
        )}
      </div>

      <div className="mt-5 space-y-2.5">
        <button
          type="button"
          onClick={() => onAttend(appointment)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary/15 px-4 py-3 font-data text-[10px] uppercase tracking-[0.16em] text-primary hover:bg-primary/20 transition-colors"
        >
          <ShieldCheck className="w-4 h-4" strokeWidth={1.8} />
          {primaryActionLabel}
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(appointment)}
            className="inline-flex items-center gap-2 rounded-full border border-surface-variant/20 bg-surface-variant/10 px-4 py-2 font-data text-[10px] uppercase tracking-[0.16em] text-text-primary hover:bg-surface-variant/20 transition-colors"
          >
            <FilePenLine className="w-4 h-4" strokeWidth={1.8} />
            {editLabel}
          </button>

          <button
            type="button"
            onClick={() => onDelete(appointment)}
            className="inline-flex items-center gap-2 rounded-full bg-[#CD8282]/10 px-4 py-2 font-data text-[10px] uppercase tracking-[0.16em] text-[#CD8282] hover:bg-[#CD8282]/15 transition-colors"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.8} />
            Excluir
          </button>
        </div>
      </div>
    </article>
  );
}
