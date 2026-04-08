"use client";

import {
  Activity,
  CheckCircle2,
  Plus,
  Thermometer,
} from "lucide-react";
import type { SymptomsSummary } from "../types";

interface SymptomsHeaderProps {
  summary: SymptomsSummary;
  onCreate: () => void;
}

export function SymptomsHeader({ summary, onCreate }: SymptomsHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-full bg-[#CD8282]/15 px-4 py-2 text-[#CD8282] transition-colors hover:bg-[#CD8282]/20"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          <span className="font-data text-[10px] uppercase tracking-[0.18em]">
            Novo episodio
          </span>
        </button>
      </div>

      <div className="rounded-[28px] border border-surface-variant/20 bg-surface-container-low p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="font-data text-[10px] uppercase tracking-[0.2em] text-text-secondary">
              Saude e bem-estar
            </span>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-text-primary">
              Sintomas
            </h1>
            <p className="mt-2 max-w-[32rem] font-data text-sm text-text-secondary">
              Registre episodios de saude do bebe, acompanhe o que ainda esta
              ativo e mantenha um historico claro para compartilhar em consultas.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#CD8282]/10 text-[#CD8282]">
            <Thermometer className="h-6 w-6" strokeWidth={2} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-surface-variant/15 p-4">
            <div className="mb-2 flex items-center gap-2 text-[#CD8282]">
              <Thermometer className="h-4 w-4" strokeWidth={2} />
              <span className="font-data text-[10px] uppercase tracking-widest">
                Ativos
              </span>
            </div>
            <span className="font-display text-2xl text-text-primary">
              {summary.activeCount}
            </span>
          </div>

          <div className="rounded-2xl bg-surface-variant/15 p-4">
            <div className="mb-2 flex items-center gap-2 text-[#8EAF96]">
              <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
              <span className="font-data text-[10px] uppercase tracking-widest">
                Resolvidos
              </span>
            </div>
            <span className="font-display text-2xl text-text-primary">
              {summary.resolvedCount}
            </span>
          </div>

          <div className="rounded-2xl bg-surface-variant/15 p-4">
            <div className="mb-2 flex items-center gap-2 text-[#88AFC7]">
              <Activity className="h-4 w-4" strokeWidth={2} />
              <span className="font-data text-[10px] uppercase tracking-widest">
                Total
              </span>
            </div>
            <span className="font-display text-2xl text-text-primary">
              {summary.totalCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
