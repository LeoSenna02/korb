"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { GrowthDataPoint } from "../types";
import { ReportGrowthCanvas } from "./ReportGrowthCanvas";
import {
  formatWeightGramsCompact,
  formatWeightGramsForReport,
} from "../utils/weight-format";

interface GrowthCanvasChartProps {
  series: GrowthDataPoint[];
}

export function GrowthCanvasChart({ series }: GrowthCanvasChartProps) {
  if (series.length < 2) {
    return (
      <div className="mb-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h3 className="font-display text-lg font-medium text-text-primary tracking-tight">
              Crescimento
            </h3>
            <p className="font-data text-xs text-text-disabled mt-0.5">
              Evolucao nos ultimos meses
            </p>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-8 flex flex-col items-center justify-center">
          <p className="font-data text-[11px] text-text-disabled">
            {series.length === 0
              ? "Nenhum dado de crescimento registrado"
              : "Registre ao menos 2 medicoes para ver o grafico"}
          </p>
        </div>
      </div>
    );
  }

  const latest = series[series.length - 1];
  const first = series[0];
  const weightGain = latest.weightGrams - first.weightGrams;
  const heightGain = latest.heightCm - first.heightCm;

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-medium text-text-primary tracking-tight">
            Crescimento
          </h3>
          <p className="font-data text-xs text-text-disabled mt-0.5">
            Evolucao nos ultimos meses
          </p>
        </div>
        <div className="text-right">
          <span className="font-display text-xl font-semibold text-text-primary tabular-nums">
            {formatWeightGramsForReport(latest.weightGrams)}
          </span>
          <span className="font-data text-[10px] text-text-disabled ml-1">atual</span>
        </div>
      </div>

      <Link href="/dashboard/growth" className="flex items-center gap-1 mb-3 group">
        <span className="font-data text-[10px] text-primary uppercase tracking-wider">
          Ver detalhes
        </span>
        <ChevronRight
          className="w-3 h-3 text-primary transition-transform duration-200 group-hover:translate-x-0.5"
          strokeWidth={1.5}
        />
      </Link>

      <div className="bg-surface-container-low rounded-2xl p-4">
        <ReportGrowthCanvas series={series} />

        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded-full bg-[#8EAF96]" />
            <span className="font-data text-[9px] text-text-disabled uppercase tracking-wider">
              Peso (+{formatWeightGramsCompact(weightGain)})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded-full bg-[#B48EAD]" />
            <span className="font-data text-[9px] text-text-disabled uppercase tracking-wider">
              Altura (+{heightGain}cm)
            </span>
          </div>
        </div>

        <div className="flex justify-around mt-4 pt-3 border-t border-surface-variant/20">
          <div className="text-center">
            <span className="font-display text-lg font-semibold text-[#8EAF96]">
              {formatWeightGramsCompact(weightGain)}
            </span>
            <p className="font-data text-[9px] text-text-disabled uppercase tracking-wider mt-0.5">
              Ganho Peso
            </p>
          </div>
          <div className="text-center">
            <span className="font-display text-lg font-semibold text-[#B48EAD]">
              {heightGain}cm
            </span>
            <p className="font-data text-[9px] text-text-disabled uppercase tracking-wider mt-0.5">
              Ganho Altura
            </p>
          </div>
          <div className="text-center">
            <span className="font-display text-lg font-semibold text-text-primary">
              {latest.cephalicCm}cm
            </span>
            <p className="font-data text-[9px] text-text-disabled uppercase tracking-wider mt-0.5">
              Cefalica
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
