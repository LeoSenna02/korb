import { CalendarPlus2, Stethoscope } from "lucide-react";

interface AppointmentEmptyStateProps {
  onCreate: () => void;
}

export function AppointmentEmptyState({
  onCreate,
}: AppointmentEmptyStateProps) {
  return (
    <div className="rounded-[28px] bg-surface-container-low border border-surface-variant/20 p-8 text-center">
      <div className="w-16 h-16 rounded-[24px] bg-[#88AFC7]/10 text-[#88AFC7] flex items-center justify-center mx-auto mb-5">
        <Stethoscope className="w-8 h-8" strokeWidth={1.75} />
      </div>

      <h2 className="font-display text-2xl text-text-primary font-semibold">
        Nenhuma consulta registrada
      </h2>
      <p className="font-data text-sm text-text-secondary mt-3 max-w-md mx-auto">
        Crie a primeira visita pediatrica para acompanhar retornos, observacoes
        e os dados clinicos ligados ao mesmo dia.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-on-primary px-5 py-3 font-display font-medium hover:bg-primary/90 transition-colors"
      >
        <CalendarPlus2 className="w-4 h-4" strokeWidth={2} />
        Criar consulta
      </button>
    </div>
  );
}
