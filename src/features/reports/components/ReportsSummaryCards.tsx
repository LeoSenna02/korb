"use client";

import { Baby, Moon, Droplet, TrendingUp } from "lucide-react";
import type { ReportPeriod, ReportSummary } from "../types";

interface ReportsSummaryCardsProps {
  summaries: ReportSummary;
  period: ReportPeriod;
}

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  day: "de hoje",
  week: "desta semana",
  month: "deste mês",
  all: "no total",
};

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const isUp = value > 0;
  return (
    <span
      className={`font-data text-[10px] font-semibold px-1.5 py-0.5 rounded-full
        ${isUp ? "text-[#8EAF96] bg-[#8EAF96]/10" : "text-[#CD8282] bg-[#CD8282]/10"}
      `}
    >
      {isUp ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

const cards = [
  {
    key: "feedings" as const,
    icon: Baby,
    label: "Total de Mamadas",
    color: "#8EAF96",
    bgColor: "bg-[#8EAF96]/10",
    getValue: (s: ReportSummary) => String(s.totalFeedings),
    getTrend: (s: ReportSummary) => s.feedingTrend,
  },
  {
    key: "sleep" as const,
    icon: Moon,
    label: "Total de Sono",
    color: "#B48EAD",
    bgColor: "bg-[#B48EAD]/10",
    getValue: (s: ReportSummary) => {
      const h = Math.floor(s.totalSleepMinutes / 60);
      const m = s.totalSleepMinutes % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    },
    getTrend: (s: ReportSummary) => s.sleepTrend,
  },
  {
    key: "diapers" as const,
    icon: Droplet,
    label: "Trocas de Fralda",
    color: "#D2B59D",
    bgColor: "bg-[#D2B59D]/10",
    getValue: (s: ReportSummary) => String(s.totalDiaperChanges),
    getTrend: (s: ReportSummary) => s.diaperTrend,
  },
  {
    key: "weight" as const,
    icon: TrendingUp,
    label: "Ganho de Peso",
    color: "#E3E2E6",
    bgColor: "bg-surface-variant",
    getValue: (s: ReportSummary) => `+${s.weightGainGrams}g`,
    getTrend: (s: ReportSummary) => s.weightTrend,
  },
];

export function ReportsSummaryCards({ summaries, period }: ReportsSummaryCardsProps) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="p-4 bg-surface-container-low rounded-2xl border border-surface-variant/20 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bgColor}`}
                  style={{ color: card.color }}
                >
                  <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                </div>
                <TrendBadge value={card.getTrend(summaries)} />
              </div>
              <div>
                <span className="font-display text-2xl font-semibold text-text-primary tracking-tight leading-none">
                  {card.getValue(summaries)}
                </span>
                <p className="font-data text-[10px] uppercase tracking-wider text-text-disabled mt-1.5 leading-none">
                  {card.label}
                </p>
                <p className="font-data text-[9px] text-text-disabled/60 mt-0.5">
                  {PERIOD_LABELS[period]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
