import type {
  HistoryActivity,
  FeedingHourBucket,
  SleepPeriod,
  DiaperBreakdown,
  GrowthDataPoint,
  TrendComparison,
  Insight,
  Milestone,
  ReportSummary,
} from "../types";

// ─── Feeding data by hour (24h buckets) ───────────────────────────────
export const MOCK_FEEDING_BY_HOUR: FeedingHourBucket[] = [
  { hour: 0, count: 0, totalMl: 0 },
  { hour: 1, count: 0, totalMl: 0 },
  { hour: 2, count: 1, totalMl: 90 },
  { hour: 3, count: 1, totalMl: 100 },
  { hour: 4, count: 0, totalMl: 0 },
  { hour: 5, count: 1, totalMl: 80 },
  { hour: 6, count: 2, totalMl: 200 },
  { hour: 7, count: 1, totalMl: 120 },
  { hour: 8, count: 2, totalMl: 240 },
  { hour: 9, count: 1, totalMl: 90 },
  { hour: 10, count: 2, totalMl: 180 },
  { hour: 11, count: 1, totalMl: 110 },
  { hour: 12, count: 2, totalMl: 200 },
  { hour: 13, count: 1, totalMl: 130 },
  { hour: 14, count: 2, totalMl: 220 },
  { hour: 15, count: 1, totalMl: 100 },
  { hour: 16, count: 2, totalMl: 190 },
  { hour: 17, count: 1, totalMl: 120 },
  { hour: 18, count: 2, totalMl: 210 },
  { hour: 19, count: 1, totalMl: 90 },
  { hour: 20, count: 1, totalMl: 110 },
  { hour: 21, count: 1, totalMl: 100 },
  { hour: 22, count: 1, totalMl: 80 },
  { hour: 23, count: 0, totalMl: 0 },
];

// ─── Sleep periods ────────────────────────────────────────────────────
export const MOCK_SLEEP_PERIODS: SleepPeriod[] = [
  {
    label: "Manhã",
    startHour: 5,
    endHour: 12,
    totalMinutes: 120,
    periods: [
      { start: "05:30", end: "07:00", durationMinutes: 90 },
      { start: "09:00", end: "10:30", durationMinutes: 90 },
    ],
  },
  {
    label: "Tarde",
    startHour: 12,
    endHour: 18,
    totalMinutes: 150,
    periods: [
      { start: "12:30", end: "14:30", durationMinutes: 120 },
      { start: "16:00", end: "16:30", durationMinutes: 30 },
    ],
  },
  {
    label: "Noite",
    startHour: 18,
    endHour: 5,
    totalMinutes: 570,
    periods: [
      { start: "18:30", end: "19:00", durationMinutes: 30 },
      { start: "19:30", end: "02:30", durationMinutes: 300 },
      { start: "03:00", end: "05:00", durationMinutes: 120 },
    ],
  },
];

// ─── Diaper breakdown ─────────────────────────────────────────────────
export const MOCK_DIAPER_BREAKDOWN: DiaperBreakdown = {
  pee: 28,
  poop: 12,
  both: 8,
};

// ─── Growth series (4 data points over 4 months) ────────────────────
export const MOCK_GROWTH_SERIES: GrowthDataPoint[] = [
  { date: "2025-12-01", weightGrams: 3200, heightCm: 48, cephalicCm: 34 },
  { date: "2026-01-01", weightGrams: 4100, heightCm: 52, cephalicCm: 36 },
  { date: "2026-02-01", weightGrams: 5100, heightCm: 56, cephalicCm: 38 },
  { date: "2026-03-01", weightGrams: 5800, heightCm: 58, cephalicCm: 39 },
];

// ─── Trend comparisons ───────────────────────────────────────────────
export const MOCK_TRENDS: TrendComparison[] = [
  {
    metric: "feedings",
    label: "Mamadas",
    current: 42,
    previous: 38,
    changePercent: 10.5,
    direction: "up",
    unit: "x",
  },
  {
    metric: "sleep",
    label: "Horas de Sono",
    current: 100,
    previous: 95,
    changePercent: 5.3,
    direction: "up",
    unit: "h",
  },
  {
    metric: "diapers",
    label: "Trocas de Fralda",
    current: 68,
    previous: 72,
    changePercent: -5.6,
    direction: "down",
    unit: "x",
  },
  {
    metric: "weight",
    label: "Ganho de Peso",
    current: 380,
    previous: 320,
    changePercent: 18.8,
    direction: "up",
    unit: "g",
  },
];

// ─── Insights ─────────────────────────────────────────────────────────
export const MOCK_INSIGHTS: Insight[] = [
  {
    id: "i1",
    type: "positive",
    icon: "sono",
    title: "Sono em alta",
    description: "Média de sono noturno: 8h 15min — acima da média para 6 semanas.",
  },
  {
    id: "i2",
    type: "positive",
    icon: "pattern",
    title: "Ritmo consistente",
    description: "Intervalo médio entre mamadas: 3h 10min. Muito estável esta semana.",
  },
  {
    id: "i3",
    type: "attention",
    icon: "mamada",
    title: "Pico às 14h",
    description: "Mamadas concentradas no início da tarde. Considere espaçar.",
  },
  {
    id: "i4",
    type: "neutral",
    icon: "fralda",
    title: "Fraldas em dia",
    description: "Média de 8 trocas/dia. Ritmo normal para a idade.",
  },
  {
    id: "i5",
    type: "positive",
    icon: "crescimento",
    title: "Crescimento acelerado",
    description: "Ganhou 900g em 30 dias. Acima do percentil 75.",
  },
  {
    id: "i6",
    type: "attention",
    icon: "sono",
    title: "Soneca curta",
    description: "Uma soneca de apenas 30min foi registrada. Pode indicar fome.",
  },
];

// ─── Milestones ──────────────────────────────────────────────────────
export const MOCK_MILESTONES: Milestone[] = [
  {
    id: "m1",
    type: "crescimento",
    title: "5kg!",
    description: "Bebê passou dos 5kg",
    date: "Fev 2026",
    badge: "gold",
  },
  {
    id: "m2",
    type: "sono",
    title: "Primeira noite",
    description: "Dormiu 6h seguidas",
    date: "Jan 2026",
    badge: "silver",
  },
  {
    id: "m3",
    type: "mamada",
    title: "1L por dia",
    description: "Chegou a 1 litro de leite/dia",
    date: "Fev 2026",
    badge: "silver",
  },
  {
    id: "m4",
    type: "fralda",
    title: "Sem assaduras",
    description: "30 dias sem assaduras",
    date: "Mar 2026",
    badge: "bronze",
  },
];

// ─── Report summaries by period ──────────────────────────────────────
export const PERIOD_SUMMARIES: Record<string, ReportSummary> = {
  day: {
    totalFeedings: 8,
    totalSleepMinutes: 680,
    totalDiaperChanges: 8,
    weightGainGrams: 30,
    feedingTrend: 14,
    sleepTrend: 5,
    diaperTrend: 0,
    weightTrend: 8,
  },
  week: {
    totalFeedings: 49,
    totalSleepMinutes: 4760,
    totalDiaperChanges: 48,
    weightGainGrams: 180,
    feedingTrend: 12,
    sleepTrend: 8,
    diaperTrend: -3,
    weightTrend: 12,
  },
  month: {
    totalFeedings: 198,
    totalSleepMinutes: 20160,
    totalDiaperChanges: 210,
    weightGainGrams: 900,
    feedingTrend: 5,
    sleepTrend: 3,
    diaperTrend: -5,
    weightTrend: 18,
  },
  all: {
    totalFeedings: 420,
    totalSleepMinutes: 43200,
    totalDiaperChanges: 450,
    weightGainGrams: 2600,
    feedingTrend: 0,
    sleepTrend: 2,
    diaperTrend: 0,
    weightTrend: 25,
  },
};
