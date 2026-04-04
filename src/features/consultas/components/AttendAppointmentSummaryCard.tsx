import { formatDate } from "@/lib/utils/format";

interface AttendAppointmentSummaryCardProps {
  doctorName?: string;
  scheduledAt?: string;
}

export function AttendAppointmentSummaryCard({
  doctorName,
  scheduledAt,
}: AttendAppointmentSummaryCardProps) {
  return (
    <div className="rounded-2xl bg-surface-container-high px-4 py-4">
      <p className="font-data text-[10px] uppercase tracking-[0.18em] text-text-secondary">
        Consulta
      </p>
      <p className="mt-2 font-display text-lg text-text-primary">{doctorName}</p>
      <p className="mt-1 font-data text-sm text-text-secondary">
        {scheduledAt ? formatDate(scheduledAt) : ""}
      </p>
    </div>
  );
}
