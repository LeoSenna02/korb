"use client";

import {
  CalendarHeart,
  CalendarPlus2,
  ChevronLeft,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { AppointmentSummary } from "../types";

interface ConsultasHeaderProps extends AppointmentSummary {
  onCreate: () => void;
}

export function ConsultasHeader({
  totalAppointments,
  upcomingAppointments,
  overdueAppointments,
  attendedAppointments,
  onCreate,
}: ConsultasHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-variant/50 transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-primary hover:bg-primary/20 transition-colors"
        >
          <CalendarPlus2 className="w-4 h-4" strokeWidth={2} />
          <span className="font-data text-[10px] uppercase tracking-[0.18em]">
            Nova consulta
          </span>
        </button>
      </div>

      <div className="rounded-[28px] bg-surface-container-low border border-surface-variant/20 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <span className="font-data text-[10px] tracking-[0.2em] uppercase text-text-secondary">
              Agenda pediatrica
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary mt-2">
              Consultas
            </h1>
            <p className="font-data text-sm text-text-secondary mt-2 max-w-[32rem]">
              Organize retornos, registre observacoes antes e depois da visita e
              conecte vacinas e crescimento em um unico dossie.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#88AFC7]/10 text-[#88AFC7] flex items-center justify-center shrink-0">
            <CalendarHeart className="w-6 h-6" strokeWidth={2} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-surface-variant/15 p-4">
            <div className="flex items-center gap-2 text-[#88AFC7] mb-2">
              <CalendarHeart className="w-4 h-4" strokeWidth={2} />
              <span className="font-data text-[10px] tracking-widest uppercase">
                Proximas
              </span>
            </div>
            <span className="font-display text-2xl text-text-primary">
              {upcomingAppointments}
            </span>
          </div>

          <div className="rounded-2xl bg-surface-variant/15 p-4">
            <div className="flex items-center gap-2 text-[#D2B59D] mb-2">
              <Clock3 className="w-4 h-4" strokeWidth={2} />
              <span className="font-data text-[10px] tracking-widest uppercase">
                Atrasadas
              </span>
            </div>
            <span className="font-display text-2xl text-text-primary">
              {overdueAppointments}
            </span>
          </div>

          <div className="rounded-2xl bg-surface-variant/15 p-4">
            <div className="flex items-center gap-2 text-[#8EAF96] mb-2">
              <ShieldCheck className="w-4 h-4" strokeWidth={2} />
              <span className="font-data text-[10px] tracking-widest uppercase">
                Atendidas
              </span>
            </div>
            <span className="font-display text-2xl text-text-primary">
              {attendedAppointments}
            </span>
          </div>
        </div>

        <p className="font-data text-xs text-text-disabled mt-4">
          {totalAppointments} consulta{totalAppointments === 1 ? "" : "s"} no total.
        </p>
      </div>
    </div>
  );
}
