"use client";

import { Baby, Droplet, Moon, Ruler, Activity } from "lucide-react";
import type { Insight, ActivityType } from "../types";

interface InsightsSectionProps {
  insights: Insight[];
  extraInsights: {
    avgFeedingInterval: string;
    avgSleepNight: string;
    feedingPeakHour: string;
    sleepQualityScore: number;
    diaperAvgPerDay: number;
    projectedWeeklyWeightGain: number;
  };
}

const iconMap: Record<ActivityType | "pattern", React.ElementType> = {
  mamada: Baby,
  fralda: Droplet,
  sono: Moon,
  crescimento: Ruler,
  pattern: Activity,
};

const typeColorMap: Record<Insight["type"], string> = {
  positive: "#8EAF96",
  neutral: "#C4C3C7",
  attention: "#CD8282",
};

const typeBgMap: Record<Insight["type"], string> = {
  positive: "bg-[#8EAF96]/10",
  neutral: "bg-surface-variant",
  attention: "bg-[#CD8282]/10",
};

export function InsightsSection({ insights, extraInsights }: InsightsSectionProps) {
  return (
    <div className="mb-8">
      <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-3">
        Padrões e Insights
      </h3>

      <div className="flex flex-col gap-3">
        {insights.map((insight) => {
          const Icon = iconMap[insight.icon];
          const color = typeColorMap[insight.type];

          return (
            <div
              key={insight.id}
              className="relative overflow-hidden group transition-all duration-200 hover:border-surface-variant/40 border border-transparent bg-surface-container-low rounded-2xl p-4"
            >
              {/* Accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full opacity-60"
                style={{ backgroundColor: color }}
              />

              <div className="flex items-start gap-3 pl-1">
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${typeBgMap[insight.type]}`}
                  style={{ color }}
                >
                  <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display text-sm font-semibold text-text-primary leading-tight">
                      {insight.title}
                    </span>
                    {insight.type === "positive" && (
                      <span className="font-data text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-[#8EAF96]/10 text-[#8EAF96]">
                        Positivo
                      </span>
                    )}
                    {insight.type === "attention" && (
                      <span className="font-data text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-[#CD8282]/10 text-[#CD8282]">
                        Atenção
                      </span>
                    )}
                  </div>
                  <p className="font-data text-[11px] text-text-secondary leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extra stats row */}
      <div className="mt-4 p-4 bg-surface-container-low rounded-2xl border border-surface-variant/20">
        <p className="font-data text-[10px] uppercase tracking-wider text-text-disabled mb-3">
          Métricas Derivadas
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <span className="font-display text-lg font-semibold text-[#8EAF96]">
              {extraInsights.avgFeedingInterval}
            </span>
            <p className="font-data text-[9px] text-text-disabled mt-0.5 uppercase tracking-wider">
              Intervalo Médio
            </p>
          </div>
          <div className="text-center">
            <span className="font-display text-lg font-semibold text-[#B48EAD]">
              {extraInsights.sleepQualityScore}
            </span>
            <p className="font-data text-[9px] text-text-disabled mt-0.5 uppercase tracking-wider">
              Score Sono
            </p>
          </div>
          <div className="text-center">
            <span className="font-display text-lg font-semibold text-text-primary">
              +{extraInsights.projectedWeeklyWeightGain}g
            </span>
            <p className="font-data text-[9px] text-text-disabled mt-0.5 uppercase tracking-wider">
              Ganho Semanal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
