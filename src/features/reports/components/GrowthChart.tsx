"use client";

import type { GrowthDataPoint } from "../types";
import { formatMonthShort, formatNumber } from "@/lib/utils/format";

interface GrowthChartProps {
  series: GrowthDataPoint[];
}

export function GrowthChart({ series }: GrowthChartProps) {
  if (series.length < 2) {
    return (
      <div className="mb-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h3 className="font-display text-lg font-medium text-text-primary tracking-tight">
              Crescimento
            </h3>
            <p className="font-data text-xs text-text-disabled mt-0.5">
              Evolução nos últimos meses
            </p>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-8 flex flex-col items-center justify-center">
          <p className="font-data text-[11px] text-text-disabled">
            {series.length === 0
              ? "Nenhum dado de crescimento registrado"
              : "Registre ao menos 2 medições para ver o gráfico"}
          </p>
        </div>
      </div>
    );
  }

  const latest = series[series.length - 1];
  const first = series[0];

  const weightGain = latest.weightGrams - first.weightGrams;
  const heightGain = latest.heightCm - first.heightCm;

  // SVG dimensions
  const width = 320;
  const height = 140;
  const paddingX = 32;
  const paddingY = 20;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Normalize data to SVG coordinates
  const minWeight = Math.min(...series.map((d) => d.weightGrams)) - 200;
  const maxWeight = Math.max(...series.map((d) => d.weightGrams)) + 200;
  const minHeight = Math.min(...series.map((d) => d.heightCm)) - 2;
  const maxHeight = Math.max(...series.map((d) => d.heightCm)) + 2;

  const toX = (i: number) =>
    paddingX + (i / (series.length - 1)) * chartW;

  const toYWeight = (v: number) =>
    paddingY + chartH - ((v - minWeight) / (maxWeight - minWeight)) * chartH;

  const toYHeight = (v: number) =>
    paddingY + chartH - ((v - minHeight) / (maxHeight - minHeight)) * chartH;

  // Weight path
  const weightPath = series
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toYWeight(d.weightGrams)}`)
    .join(" ");

  // Height path
  const heightPath = series
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toYHeight(d.heightCm)}`)
    .join(" ");

  // Area path (weight fill)
  const weightAreaPath =
    weightPath +
    ` L ${toX(series.length - 1)} ${paddingY + chartH} L ${toX(0)} ${paddingY + chartH} Z`;

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-medium text-text-primary tracking-tight">
            Crescimento
          </h3>
          <p className="font-data text-xs text-text-disabled mt-0.5">
            Evolução nos últimos meses
          </p>
        </div>
        <div className="text-right">
          <span className="font-display text-xl font-semibold text-text-primary tabular-nums">
            {formatNumber(latest.weightGrams)}g
          </span>
          <span className="font-data text-[10px] text-text-disabled ml-1">atual</span>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-2xl p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ maxHeight: "160px" }}
        >
          {/* Grid lines */}
          {[0, 1, 2, 3].map((i) => {
            const y = paddingY + (i / 3) * chartH;
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(74,75,83,0.3)"
                strokeWidth="0.5"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Weight area fill */}
          <path
            d={weightAreaPath}
            fill="url(#weightGradient)"
            opacity="0.15"
          />

          {/* Weight line */}
          <path
            d={weightPath}
            fill="none"
            stroke="#8EAF96"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Height line */}
          <path
            d={heightPath}
            fill="none"
            stroke="#B48EAD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6,3"
          />

          {/* Weight data points */}
          {series.map((d, i) => (
            <g key={`w-${i}`}>
              <circle
                cx={toX(i)}
                cy={toYWeight(d.weightGrams)}
                r="5"
                fill="#1E1F26"
                stroke="#8EAF96"
                strokeWidth="2"
              />
              <title>{d.weightGrams}g</title>
            </g>
          ))}

          {/* Height data points */}
          {series.map((d, i) => (
            <g key={`h-${i}`}>
              <circle
                cx={toX(i)}
                cy={toYHeight(d.heightCm)}
                r="4"
                fill="#1E1F26"
                stroke="#B48EAD"
                strokeWidth="2"
              />
              <title>{d.heightCm}cm</title>
            </g>
          ))}

          {/* X-axis labels */}
          {series.map((d, i) => {
            const label = formatMonthShort(d.date);
            return (
              <text
                key={i}
                x={toX(i)}
                y={height - 4}
                textAnchor="middle"
                fill="#6B6B73"
                fontSize="9"
                fontFamily="var(--font-dm-mono)"
              >
                {label}
              </text>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8EAF96" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8EAF96" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded-full bg-[#8EAF96]" />
            <span className="font-data text-[9px] text-text-disabled uppercase tracking-wider">
              Peso (+{weightGain}g)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded-full bg-[#B48EAD]" style={{ borderStyle: "dashed" }} />
            <span className="font-data text-[9px] text-text-disabled uppercase tracking-wider">
              Altura (+{heightGain}cm)
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex justify-around mt-4 pt-3 border-t border-surface-variant/20">
          <div className="text-center">
            <span className="font-display text-lg font-semibold text-[#8EAF96]">
              {formatNumber(weightGain)}g
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
              Cefálica
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
