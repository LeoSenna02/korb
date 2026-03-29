import { parseDateLocal } from "@/lib/utils/format";
import type {
  FeedingRecord,
  SleepRecord,
  DiaperRecord,
  GrowthRecord,
} from "../types";
import type {
  ReportSummary,
  FeedingHourBucket,
  SleepPeriod,
  SleepPeriodBlock,
  DiaperBreakdown,
  GrowthDataPoint,
  TrendComparison,
  Milestone,
  Insight,
} from "@/features/reports/types";

export function buildReportSummary(
  feedings: FeedingRecord[],
  sleeps: SleepRecord[],
  diapers: DiaperRecord[],
  growthRecords: GrowthRecord[],
  prevFeedings: FeedingRecord[],
  prevSleeps: SleepRecord[],
  prevDiapers: DiaperRecord[],
  prevGrowth: GrowthRecord[]
): ReportSummary {
  const totalFeedings = feedings.length;
  const totalSleepMinutes = calcTotalSleepMinutes(sleeps);
  const totalDiaperChanges = diapers.length;
  const weightGainGrams = calcWeightGain(growthRecords);

  const prevTotalFeedings = prevFeedings.length;
  const prevTotalSleepMinutes = calcTotalSleepMinutes(prevSleeps);
  const prevTotalDiaperChanges = prevDiapers.length;
  const prevWeightGainGrams = calcWeightGain(prevGrowth);

  return {
    totalFeedings,
    totalSleepMinutes,
    totalDiaperChanges,
    weightGainGrams,
    feedingTrend: calcTrendPercent(totalFeedings, prevTotalFeedings),
    sleepTrend: calcTrendPercent(totalSleepMinutes, prevTotalSleepMinutes),
    diaperTrend: calcTrendPercent(totalDiaperChanges, prevTotalDiaperChanges),
    weightTrend: calcTrendPercent(weightGainGrams, prevWeightGainGrams),
  };
}

function calcTotalSleepMinutes(sleeps: SleepRecord[]): number {
  return sleeps.reduce((total, s) => {
    if (!s.endedAt) return total;
    const start = new Date(s.startedAt).getTime();
    const end = new Date(s.endedAt).getTime();
    return total + Math.round((end - start) / 60000);
  }, 0);
}

function calcWeightGain(growthRecords: GrowthRecord[]): number {
  if (growthRecords.length < 2) return 0;
  const sorted = [...growthRecords].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (first.weightKg == null || last.weightKg == null) return 0;
  return Math.round((last.weightKg - first.weightKg) * 1000);
}

function calcTrendPercent(current: number, previous: number): number {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function buildFeedingByHour(feedings: FeedingRecord[]): FeedingHourBucket[] {
  const buckets: FeedingHourBucket[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: 0,
    totalMl: 0,
  }));

  for (const f of feedings) {
    const hour = new Date(f.startedAt).getHours();
    buckets[hour].count += 1;
    buckets[hour].totalMl += f.volumeMl ?? 0;
  }

  return buckets;
}

export function buildSleepPeriods(sleeps: SleepRecord[]): SleepPeriod[] {
  const manhaBlocks: SleepPeriodBlock[] = [];
  const tardeBlocks: SleepPeriodBlock[] = [];
  const noiteBlocks: SleepPeriodBlock[] = [];

  for (const s of sleeps) {
    if (!s.endedAt) continue;
    const start = new Date(s.startedAt);
    const end = new Date(s.endedAt);
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    const startHour = start.getHours();
    const startMin = start.getMinutes();
    const endHour = end.getHours();
    const endMin = end.getMinutes();

    const block: SleepPeriodBlock = {
      start: `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`,
      end: `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`,
      durationMinutes,
    };

    if (startHour >= 5 && startHour < 12) {
      manhaBlocks.push(block);
    } else if (startHour >= 12 && startHour < 18) {
      tardeBlocks.push(block);
    } else {
      noiteBlocks.push(block);
    }
  }

  return [
    {
      label: "Manhã",
      startHour: 5,
      endHour: 12,
      totalMinutes: manhaBlocks.reduce((s, b) => s + b.durationMinutes, 0),
      periods: manhaBlocks,
    },
    {
      label: "Tarde",
      startHour: 12,
      endHour: 18,
      totalMinutes: tardeBlocks.reduce((s, b) => s + b.durationMinutes, 0),
      periods: tardeBlocks,
    },
    {
      label: "Noite",
      startHour: 18,
      endHour: 5,
      totalMinutes: noiteBlocks.reduce((s, b) => s + b.durationMinutes, 0),
      periods: noiteBlocks,
    },
  ];
}

export function buildDiaperBreakdown(diapers: DiaperRecord[]): DiaperBreakdown {
  const breakdown: DiaperBreakdown = { pee: 0, poop: 0, both: 0 };
  for (const d of diapers) {
    if (d.type === "xixi") breakdown.pee += 1;
    else if (d.type === "coco") breakdown.poop += 1;
    else if (d.type === "ambos") breakdown.both += 1;
  }
  return breakdown;
}

export function buildGrowthSeries(growthRecords: GrowthRecord[]): GrowthDataPoint[] {
  return growthRecords
    .filter((r) => r.weightKg != null && r.heightCm != null)
    .map((r) => ({
      date: r.measuredAt,
      weightGrams: Math.round((r.weightKg ?? 0) * 1000),
      heightCm: r.heightCm ?? 0,
      cephalicCm: r.cephalicCm ?? 0,
    }));
}

export function buildTrendComparisons(
  current: ReportSummary,
  previous: ReportSummary
): TrendComparison[] {
  return [
    buildSingleTrend("feedings", "Mamadas", current.totalFeedings, previous.totalFeedings, "x"),
    buildSingleTrend("sleep", "Horas de Sono", Math.round(current.totalSleepMinutes / 60), Math.round(previous.totalSleepMinutes / 60), "h"),
    buildSingleTrend("diapers", "Trocas de Fralda", current.totalDiaperChanges, previous.totalDiaperChanges, "x"),
    buildSingleTrend("weight", "Ganho de Peso", current.weightGainGrams, previous.weightGainGrams, "g"),
  ];
}

function buildSingleTrend(
  metric: string,
  label: string,
  current: number,
  previous: number,
  unit: string
): TrendComparison {
  const changePercent = previous === 0
    ? (current > 0 ? 100 : 0)
    : parseFloat(((current - previous) / previous * 100).toFixed(1));

  const direction: TrendComparison["direction"] =
    changePercent > 0 ? "up" : changePercent < 0 ? "down" : "stable";

  return { metric, label, current, previous, changePercent, direction, unit };
}

export function buildMilestones(
  growthRecords: GrowthRecord[],
  sleeps: SleepRecord[],
  feedings: FeedingRecord[]
): Milestone[] {
  const milestones: Milestone[] = [];

  const sortedGrowth = [...growthRecords].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  );

  for (const g of sortedGrowth) {
    if (g.weightKg != null && g.weightKg >= 5) {
      const date = new Date(g.measuredAt);
      milestones.push({
        id: `milestone-5kg-${g.id}`,
        type: "crescimento",
        title: "5kg!",
        description: "Bebê passou dos 5kg",
        date: formatMonthYear(date),
        badge: "gold",
      });
      break;
    }
  }

  for (const s of sleeps) {
    if (!s.endedAt) continue;
    const durationHours = (new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 3600000;
    if (durationHours >= 6) {
      const date = new Date(s.startedAt);
      milestones.push({
        id: `milestone-sleep6h-${s.id}`,
        type: "sono",
        title: "Primeira noite",
        description: "Dormiu 6h seguidas",
        date: formatMonthYear(date),
        badge: "silver",
      });
      break;
    }
  }

  const dailyVolumes = new Map<string, number>();
  for (const f of feedings) {
    const day = new Date(f.startedAt).toISOString().slice(0, 10);
    dailyVolumes.set(day, (dailyVolumes.get(day) ?? 0) + (f.volumeMl ?? 0));
  }
  for (const [day, total] of dailyVolumes) {
    if (total >= 1000) {
      const date = parseDateLocal(day);
      milestones.push({
        id: `milestone-1l-${day}`,
        type: "mamada",
        title: "1L por dia",
        description: "Chegou a 1 litro de leite/dia",
        date: formatMonthYear(date),
        badge: "silver",
      });
      break;
    }
  }

  if (sortedGrowth.length >= 2) {
    const last = sortedGrowth[sortedGrowth.length - 1];
    const first = sortedGrowth[0];
    const gain = (last.weightKg ?? 0) - (first.weightKg ?? 0);
    if (gain >= 0.5) {
      milestones.push({
        id: `milestone-growth`,
        type: "crescimento",
        title: `${Math.round(gain * 1000)}g ganhos`,
        description: `De ${Math.round((first.weightKg ?? 0) * 1000)}g para ${Math.round((last.weightKg ?? 0) * 1000)}g`,
        date: formatMonthYear(new Date(last.measuredAt)),
        badge: "bronze",
      });
    }
  }

  return milestones.slice(0, 4);
}

export function buildInsights(
  feedings: FeedingRecord[],
  sleeps: SleepRecord[],
  diapers: DiaperRecord[],
  growthRecords: GrowthRecord[],
  period: string
): Insight[] {
  const insights: Insight[] = [];

  buildSleepInsights(sleeps, insights);
  buildFeedingInsights(feedings, insights);
  buildDiaperInsights(diapers, insights, period);
  buildGrowthInsights(growthRecords, insights);

  return insights.slice(0, 6);
}

function buildSleepInsights(sleeps: SleepRecord[], insights: Insight[]): void {
  const nightSleeps = sleeps.filter(
    (s) => s.type === "night" && s.endedAt != null
  );

  if (nightSleeps.length > 0) {
    const totalMin = nightSleeps.reduce((total, s) => {
      const start = new Date(s.startedAt).getTime();
      const end = new Date(s.endedAt!).getTime();
      return total + (end - start) / 60000;
    }, 0);
    const avgMin = totalMin / nightSleeps.length;

    if (avgMin >= 360) {
      insights.push({
        id: "insight-sleep-night-good",
        type: "positive",
        icon: "sono",
        title: "Sono noturno consistente",
        description: `Media de sono noturno: ${formatHourMinute(avgMin)} — acima da media para a idade.`,
      });
    } else if (avgMin < 180) {
      insights.push({
        id: "insight-sleep-night-low",
        type: "attention",
        icon: "sono",
        title: "Sono noturno baixo",
        description: `Media de sono noturno: ${formatHourMinute(avgMin)}. Considere ajustar a rotina.`,
      });
    }
  }

  const shortNaps = sleeps.filter((s) => {
    if (!s.endedAt) return false;
    const dur = (new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000;
    return dur > 0 && dur < 30;
  });

  if (shortNaps.length > 0) {
    insights.push({
      id: "insight-short-nap",
      type: "attention",
      icon: "sono",
      title: "Soneca curta",
      description: `${shortNaps.length} soneca${shortNaps.length > 1 ? "s" : ""} de menos de 30min registrada${shortNaps.length > 1 ? "s" : ""}. Pode indicar fome ou desconforto.`,
    });
  }
}

function buildFeedingInsights(feedings: FeedingRecord[], insights: Insight[]): void {
  if (feedings.length < 2) return;

  const sorted = [...feedings].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );

  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i].startedAt).getTime() - new Date(sorted[i - 1].startedAt).getTime()) / 60000;
    intervals.push(diff);
  }

  if (intervals.length > 0) {
    const avgMin = intervals.reduce((s, v) => s + v, 0) / intervals.length;
    const variance = intervals.reduce((s, v) => s + Math.pow(v - avgMin, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const coeffVariation = avgMin > 0 ? stdDev / avgMin : 0;

    if (coeffVariation < 0.25) {
      insights.push({
        id: "insight-feeding-consistent",
        type: "positive",
        icon: "pattern",
        title: "Ritmo consistente",
        description: `Intervalo medio entre mamadas: ${formatHourMinute(avgMin)}. Muito estavel neste periodo.`,
      });
    } else if (coeffVariation > 0.5) {
      insights.push({
        id: "insight-feeding-irregular",
        type: "attention",
        icon: "pattern",
        title: "Ritmo irregular",
        description: `Intervalo medio entre mamadas: ${formatHourMinute(avgMin)}, mas com grande variacao. Tente manter horarios mais regulares.`,
      });
    }
  }

  const hourCounts = new Map<number, number>();
  for (const f of feedings) {
    const h = new Date(f.startedAt).getHours();
    hourCounts.set(h, (hourCounts.get(h) ?? 0) + 1);
  }

  let peakHour = 0;
  let peakCount = 0;
  for (const [h, c] of hourCounts) {
    if (c > peakCount) {
      peakCount = c;
      peakHour = h;
    }
  }

  if (peakCount >= feedings.length * 0.2 && feedings.length >= 5) {
    insights.push({
      id: "insight-feeding-peak",
      type: "neutral",
      icon: "mamada",
      title: `Pico as ${String(peakHour).padStart(2, "0")}:00`,
      description: `${peakCount} mamadas concentradas neste horario. ${peakHour >= 12 && peakHour <= 16 ? "Considere espacar as mamadas a tarde." : "Distribua melhor ao longo do dia."}`,
    });
  }
}

function buildDiaperInsights(
  diapers: DiaperRecord[],
  insights: Insight[],
  period: string
): void {
  if (diapers.length === 0) return;

  const daysMap = new Map<string, number>();
  for (const d of diapers) {
    const day = new Date(d.changedAt).toISOString().slice(0, 10);
    daysMap.set(day, (daysMap.get(day) ?? 0) + 1);
  }

  const avgPerDay = diapers.length / Math.max(daysMap.size, 1);

  if (avgPerDay >= 6 && avgPerDay <= 10) {
    insights.push({
      id: "insight-diaper-normal",
      type: "neutral",
      icon: "fralda",
      title: "Fraldas em dia",
      description: `Media de ${avgPerDay.toFixed(1)} trocas/dia. Ritmo normal para a idade.`,
    });
  } else if (avgPerDay > 10) {
    insights.push({
      id: "insight-diaper-high",
      type: "attention",
      icon: "fralda",
      title: "Muitas trocas",
      description: `Media de ${avgPerDay.toFixed(1)} trocas/dia. Acima do esperado. Observe se ha diarreia.`,
    });
  }
}

function buildGrowthInsights(
  growthRecords: GrowthRecord[],
  insights: Insight[]
): void {
  if (growthRecords.length < 2) return;

  const sorted = [...growthRecords].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (first.weightKg == null || last.weightKg == null) return;

  const gainGrams = Math.round((last.weightKg - first.weightKg) * 1000);
  const daysDiff = (new Date(last.measuredAt).getTime() - new Date(first.measuredAt).getTime()) / 86400000;

  if (daysDiff <= 0) return;

  const weeklyGain = Math.round((gainGrams / daysDiff) * 7);

  if (weeklyGain >= 150 && weeklyGain <= 300) {
    insights.push({
      id: "insight-growth-good",
      type: "positive",
      icon: "crescimento",
      title: "Crescimento saudavel",
      description: `Ganho medio de ${weeklyGain}g/semana. Dentro da faixa esperada.`,
    });
  } else if (weeklyGain > 300) {
    insights.push({
      id: "insight-growth-fast",
      type: "positive",
      icon: "crescimento",
      title: "Crescimento acelerado",
      description: `Ganho medio de ${weeklyGain}g/semana. Acima da media — pico de crescimento.`,
    });
  } else if (weeklyGain < 100 && weeklyGain > 0) {
    insights.push({
      id: "insight-growth-slow",
      type: "attention",
      icon: "crescimento",
      title: "Crescimento lento",
      description: `Ganho medio de ${weeklyGain}g/semana. Consulte o pediatrico se persistir.`,
    });
  }
}

function formatHourMinute(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatMonthYear(date: Date): string {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}
