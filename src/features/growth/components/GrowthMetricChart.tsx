"use client";

import type {
  GrowthChartDataPoint,
  GrowthMetricReferenceState,
} from "../types";
import { formatNumber } from "@/lib/utils/format";
import { GrowthMetricCanvas } from "./GrowthMetricCanvas";
import { GrowthMetricReferenceMeta } from "./GrowthMetricReferenceMeta";

interface GrowthMetricChartProps {
  title: string;
  subtitle: string;
  reference: GrowthMetricReferenceState;
  series: GrowthChartDataPoint[];
  color: string;
  unit: string;
}

export function GrowthMetricChart({
  title,
  subtitle,
  reference,
  series,
  color,
  unit,
}: GrowthMetricChartProps) {
  if (series.length === 0) {
    return (
      <div className="mb-6">
        <div className="mb-3">
          <h3 className="font-display text-base font-medium text-text-primary tracking-tight">
            {title}
          </h3>
          <p className="font-data text-[11px] text-text-disabled mt-0.5">
            {subtitle}
          </p>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-6 flex items-center justify-center border border-outline-variant/10">
          <p className="font-data text-[11px] text-text-disabled">
            Nenhum dado registrado
          </p>
        </div>
      </div>
    );
  }

  const latest = series[series.length - 1];
  const first = series[0];
  const gain = series.length > 1 ? latest.value - first.value : null;
  const gainPrefix = gain != null && gain >= 0 ? "+" : "";

  return (
    <div className="mb-6">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="font-display text-base font-medium text-text-primary tracking-tight">
            {title}
          </h3>
          <p className="font-data text-[11px] text-text-disabled mt-0.5">
            {subtitle}
          </p>
          <GrowthMetricReferenceMeta reference={reference} />
        </div>
        <div className="text-right">
          <span className="font-display text-xl font-semibold text-text-primary tabular-nums">
            {formatNumber(latest.value)}
          </span>
          <span className="font-data text-[10px] text-text-disabled ml-1">{unit}</span>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
        <GrowthMetricCanvas
          color={color}
          referenceBand={reference.band}
          series={series}
          title={title}
          unit={unit}
        />

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-variant/15">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-0.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="font-data text-[9px] text-text-disabled uppercase tracking-wider">
                {title}
              </span>
            </div>

            {reference.band ? (
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-3 rounded-sm border border-white/20 bg-white/10" />
                <span className="font-data text-[9px] text-text-disabled uppercase tracking-wider">
                  Faixa OMS
                </span>
              </div>
            ) : null}
          </div>

          <span
            className="font-data text-[10px] uppercase tracking-wider"
            style={{ color }}
          >
            {gain != null ? (
              <>
                {gainPrefix}
                {formatNumber(gain)} {unit}
              </>
            ) : (
              "1 medicao"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
