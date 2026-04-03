"use client";

import { ChevronLeft, Lock, ShieldCheck, Syringe } from "lucide-react";
import { useRouter } from "next/navigation";

interface VaccinesHeaderProps {
  totalVaccines: number;
  takenVaccines: number;
  pendingVaccines: number;
  lockedVaccines: number;
}

export function VaccinesHeader({
  totalVaccines,
  takenVaccines,
  pendingVaccines,
  lockedVaccines,
}: VaccinesHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-variant/50 transition-colors mb-4"
        aria-label="Voltar"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="rounded-[28px] bg-surface-container-low border border-surface-variant/20 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <span className="font-data text-[10px] tracking-[0.2em] uppercase text-text-secondary">
              Calendario SUS 2026
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary mt-2">
              Vacinas
            </h1>
            <p className="font-data text-sm text-text-secondary mt-2 max-w-[32rem]">
              Gerencie o calendario de vacinas do bebe por mes, registre
              aplicacoes e acompanhe o que ainda permanece trancado.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#8EAF96]/10 text-[#8EAF96] flex items-center justify-center shrink-0">
            <Syringe className="w-6 h-6" strokeWidth={2} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-surface-variant/15 p-4">
            <div className="flex items-center gap-2 text-[#8EAF96] mb-2">
              <ShieldCheck className="w-4 h-4" strokeWidth={2} />
              <span className="font-data text-[10px] tracking-widest uppercase">
                Tomadas
              </span>
            </div>
            <span className="font-display text-2xl text-text-primary">
              {takenVaccines}
            </span>
          </div>

          <div className="rounded-2xl bg-surface-variant/15 p-4">
            <div className="flex items-center gap-2 text-[#D2B59D] mb-2">
              <Syringe className="w-4 h-4" strokeWidth={2} />
              <span className="font-data text-[10px] tracking-widest uppercase">
                Pendentes
              </span>
            </div>
            <span className="font-display text-2xl text-text-primary">
              {pendingVaccines}
            </span>
          </div>

          <div className="rounded-2xl bg-surface-variant/15 p-4">
            <div className="flex items-center gap-2 text-text-disabled mb-2">
              <Lock className="w-4 h-4" strokeWidth={2} />
              <span className="font-data text-[10px] tracking-widest uppercase">
                Trancadas
              </span>
            </div>
            <span className="font-display text-2xl text-text-primary">
              {lockedVaccines}
            </span>
          </div>
        </div>

        <p className="font-data text-xs text-text-disabled mt-4">
          {takenVaccines} de {totalVaccines} vacinas exibidas ja foram registradas.
        </p>
      </div>
    </div>
  );
}
