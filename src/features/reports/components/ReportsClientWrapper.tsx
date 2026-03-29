"use client";

import { useState, useMemo } from "react";
import type { ReportPeriod } from "../types";
import { useReportsData } from "../hooks/useReportsData";
import { useReportInsights } from "../hooks/useReportInsights";
import { ReportsPeriodSelector } from "./ReportsPeriodSelector";
import { ReportsSummaryCards } from "./ReportsSummaryCards";
import { FeedingChart } from "./FeedingChart";
import { SleepChart } from "./SleepChart";
import { DiaperChart } from "./DiaperChart";
import { GrowthChart } from "./GrowthChart";
import { TrendAnalysis } from "./TrendAnalysis";
import { InsightsSection } from "./InsightsSection";

function ReportSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-2 px-4">
        {[80, 80, 80, 80].map((w, i) => (
          <div key={i} className="h-9 rounded-full bg-surface-variant/30" style={{ width: w }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 px-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-surface-variant/20" />
        ))}
      </div>
      <div className="px-4 space-y-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-2xl bg-surface-variant/20" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-variant/20 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <p className="font-display text-sm font-medium text-text-secondary text-center">
        Sem dados suficientes
      </p>
      <p className="font-data text-[11px] text-text-disabled text-center mt-1">
        Comece a registrar atividades para ver seus relatórios
      </p>
    </div>
  );
}

export function ReportsClientWrapper() {
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const data = useReportsData(period, setPeriod);

  const insightsParams = useMemo(() => ({
    feedings: data.rawFeedings,
    sleeps: data.rawSleeps,
    diapers: data.rawDiapers,
    growthRecords: data.rawGrowth,
    period,
  }), [data.rawFeedings, data.rawSleeps, data.rawDiapers, data.rawGrowth, period]);

  const insightsData = useReportInsights(insightsParams);

  if (data.isLoading) {
    return (
      <>
        <ReportsPeriodSelector active={period} onChange={setPeriod} />
        <ReportSkeleton />
      </>
    );
  }

  if (data.error) {
    return (
      <>
        <ReportsPeriodSelector active={period} onChange={setPeriod} />
        <div className="px-4 py-8 text-center">
          <p className="font-data text-sm text-[#CD8282]">{data.error}</p>
          <button
            onClick={data.refresh}
            className="mt-3 px-4 py-2 rounded-xl bg-surface-variant/30 font-data text-xs text-text-secondary"
          >
            Tentar novamente
          </button>
        </div>
      </>
    );
  }

  const hasData = data.summaries.totalFeedings > 0 || data.summaries.totalSleepMinutes > 0 || data.summaries.totalDiaperChanges > 0;

  return (
    <>
      <ReportsPeriodSelector active={period} onChange={setPeriod} />
      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          <ReportsSummaryCards summaries={data.summaries} period={period} />
          <FeedingChart buckets={data.feedingByHour} period={period} />
          <SleepChart periods={data.sleepPeriods} period={period} />
          <DiaperChart breakdown={data.diaperBreakdown} period={period} />
          <GrowthChart series={data.growthSeries} />
          <TrendAnalysis trends={data.trends} summariesPrev={data.summariesPrev} />
          <InsightsSection insights={data.insights} extraInsights={insightsData} />
        </>
      )}
    </>
  );
}
