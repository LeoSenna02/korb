import type {
  FeedingRecord,
  DiaperRecord,
  SleepRecord,
  GrowthRecord,
} from "../types";
import type { HistoryActivity, WeeklyStat } from "@/features/history/types";
import { getFeedingsByBabyId } from "./feeding";
import { getDiapersByBabyId } from "./diaper";
import { getSleepsByBabyId } from "./sleep";
import { getGrowthByBabyId } from "./growth";
import { formatDate, formatTime, formatDuration, formatDurationFromDates } from "@/lib/utils/format";

function formatFeedingActivity(r: FeedingRecord): HistoryActivity {
  let title = "Amamentação";
  let details = "";

  if (r.type === "bottle") {
    title = "Mamadeira";
    details = r.volumeMl ? `${r.volumeMl}ml` : "";
  } else if (r.type === "both") {
    if (r.leftSeconds !== undefined && r.rightSeconds !== undefined && (r.leftSeconds > 0 || r.rightSeconds > 0)) {
      const leftMin = formatDuration(r.leftSeconds);
      const rightMin = formatDuration(r.rightSeconds);
      details = `Esq ${leftMin} | Dir ${rightMin}`;
    } else {
      details = "Ambos os lados";
    }
  } else {
    details = r.type === "left" ? "Seio esquerdo" : "Seio direito";
  }

  if (r.notes) {
    details += details ? ` — ${r.notes}` : r.notes;
  }

  return {
    id: r.id,
    type: "mamada",
    title,
    details: details || "Amamentação",
    date: formatDate(r.startedAt),
    time: formatTime(r.startedAt),
    duration: r.durationSeconds ? formatDuration(r.durationSeconds) : undefined,
  };
}

function formatDiaperActivity(r: DiaperRecord): HistoryActivity {
  const typeLabels: Record<string, string> = {
    xixi: "Xixi",
    coco: "Cocô",
    ambos: "Xixi + Cocô",
  };

  const details = typeLabels[r.type] || r.type;

  return {
    id: r.id,
    type: "fralda",
    title: "Troca de Fralda",
    details,
    date: formatDate(r.changedAt),
    time: formatTime(r.changedAt),
  };
}

function formatSleepActivity(r: SleepRecord): HistoryActivity {
  const title = r.type === "nap" ? "Soneca" : "Sono Noturno";
  const details = r.notes || (r.type === "nap" ? "Berço" : "Cama");

  return {
    id: r.id,
    type: "sono",
    title,
    details,
    date: formatDate(r.startedAt),
    time: formatTime(r.startedAt),
    duration: r.endedAt ? formatDurationFromDates(r.startedAt, r.endedAt) : undefined,
    isOngoing: !r.endedAt,
  };
}

function formatGrowthActivity(r: GrowthRecord): HistoryActivity {
  const parts: string[] = [];

  if (r.weightKg) parts.push(`${r.weightKg} kg`);
  if (r.heightCm) parts.push(`${r.heightCm} cm`);
  if (r.cephalicCm) parts.push(`${r.cephalicCm} cm`);

  return {
    id: r.id,
    type: "crescimento",
    title: "Medição",
    details: parts.length > 0 ? parts.join(" / ") : "Registro de crescimento",
    date: formatDate(r.measuredAt),
    time: formatTime(r.measuredAt),
  };
}

export async function getAllActivitiesForHistory(
  babyId: string
): Promise<HistoryActivity[]> {
  const [feedings, diapers, sleeps, growth] = await Promise.all([
    getFeedingsByBabyId(babyId),
    getDiapersByBabyId(babyId),
    getSleepsByBabyId(babyId),
    getGrowthByBabyId(babyId),
  ]);

  const activities: HistoryActivity[] = [
    ...feedings.map(formatFeedingActivity),
    ...diapers.map(formatDiaperActivity),
    ...sleeps.map(formatSleepActivity),
    ...growth.map(formatGrowthActivity),
  ];

  activities.sort((a, b) => {
    const dateA = new Date(a.date.split("/").reverse().join("-") + "T" + a.time);
    const dateB = new Date(b.date.split("/").reverse().join("-") + "T" + b.time);
    return dateB.getTime() - dateA.getTime();
  });

  return activities;
}

export async function getWeeklyStats(
  babyId: string
): Promise<WeeklyStat[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  oneWeekAgo.setHours(0, 0, 0, 0);

  const [feedings, sleeps, diapers] = await Promise.all([
    getFeedingsByBabyId(babyId),
    getSleepsByBabyId(babyId),
    getDiapersByBabyId(babyId),
  ]);

  const thisWeekFeedings = feedings.filter(
    (f) => new Date(f.createdAt) >= oneWeekAgo
  );

  const thisWeekSleeps = sleeps.filter(
    (s) => new Date(s.startedAt) >= oneWeekAgo && s.endedAt
  );

  const totalSleepSeconds = thisWeekSleeps.reduce((acc, s) => {
    if (!s.endedAt) return acc;
    return (
      acc +
      (new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 1000
    );
  }, 0);

  const avgSleepHoursPerDay =
    thisWeekSleeps.length > 0
      ? (totalSleepSeconds / 3600 / 7).toFixed(1)
      : "0";

  const thisWeekDiapers = diapers.filter(
    (d) => new Date(d.createdAt) >= oneWeekAgo
  );

  return [
    {
      id: "feedings",
      icon: "feeding",
      value: String(thisWeekFeedings.length),
      label: "Mamadas",
    },
    {
      id: "sleep",
      icon: "sleep",
      value: `${avgSleepHoursPerDay}h`,
      label: "Média Sono/Dia",
    },
    {
      id: "diapers",
      icon: "diaper",
      value: String(thisWeekDiapers.length),
      label: "Fraldas",
    },
  ];
}
