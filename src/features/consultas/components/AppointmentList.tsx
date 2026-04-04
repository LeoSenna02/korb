import type { AppointmentListItem } from "../types";
import { AppointmentCard } from "./AppointmentCard";

interface AppointmentListProps {
  title: string;
  description: string;
  appointments: AppointmentListItem[];
  emptyMessage: string;
  onEdit: (appointment: AppointmentListItem) => void;
  onAttend: (appointment: AppointmentListItem) => void;
  onDelete: (appointment: AppointmentListItem) => void;
}

export function AppointmentList({
  title,
  description,
  appointments,
  emptyMessage,
  onEdit,
  onAttend,
  onDelete,
}: AppointmentListProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-text-primary font-semibold">
          {title}
        </h2>
        <p className="font-data text-sm text-text-secondary mt-1">
          {description}
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-surface-variant/20 bg-surface-container-low px-5 py-6">
          <p className="font-data text-sm text-text-disabled">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onEdit={onEdit}
              onAttend={onAttend}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
