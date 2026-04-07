import type {
  FeedingRecord,
  DiaperRecord,
  SleepRecord,
  GrowthRecord,
  PediatricAppointment,
} from "../types";
import type { HistoryActivity, WeeklyStat } from "@/features/history/types";
import { getAppointmentsByBabyId, getRecentAttendedAppointments } from "./appointment";
import { getFeedingsByBabyId, getRecentFeedings } from "./feeding";
import { getDiapersByBabyId, getRecentDiapers } from "./diaper";
import { getSleepsByBabyId, getRecentSleeps } from "./sleep";
import { getGrowthByBabyId, getRecentGrowthRecords } from "./growth";
import { getReportFeedings, getReportSleeps, getReportDiapers } from "./reports";
import { formatDate, formatTime, formatDuration, formatDurationFromDates } from "@/lib/utils/format";

export interface HistoryPageResult {
  activities: HistoryActivity[];
  hasMore: boolean;
}

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
    sortKey: r.startedAt,
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
    sortKey: r.changedAt,
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
    sortKey: r.startedAt,
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
    sortKey: r.measuredAt,
  };
}

function formatAppointmentActivity(r: PediatricAppointment): HistoryActivity {
  return {
    id: r.id,
    type: "consulta",
    title: "Consulta pediatrica",
    details: `${r.doctorName} â€” ${r.location}`,
    date: formatDate(r.attendedAt ?? r.scheduledAt),
    time: formatTime(r.attendedAt ?? r.scheduledAt),
    sortKey: r.attendedAt ?? r.scheduledAt,
  };
}

export async function getAllActivitiesForHistory(
  babyId: string
): Promise<HistoryActivity[]> {
  const [feedings, diapers, sleeps, growth, appointments] = await Promise.all([
    getFeedingsByBabyId(babyId),
    getDiapersByBabyId(babyId),
    getSleepsByBabyId(babyId),
    getGrowthByBabyId(babyId),
    getAppointmentsByBabyId(babyId),
  ]);

  const activities: HistoryActivity[] = [
    ...feedings.map(formatFeedingActivity),
    ...diapers.map(formatDiaperActivity),
    ...sleeps.map(formatSleepActivity),
    ...growth.map(formatGrowthActivity),
    ...appointments
      .filter((appointment) => appointment.status === "attended")
      .map(formatAppointmentActivity),
  ];

  activities.sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  return activities;
}

export async function getHistoryPage(
  babyId: string,
  limit: number,
  offset = 0
): Promise<HistoryPageResult> {
  const fetchCount = Math.max(limit + offset, limit);

  const [feedings, diapers, sleeps, growth, appointments] = await Promise.all([
    getRecentFeedings(babyId, fetchCount),
    getRecentDiapers(babyId, fetchCount),
    getRecentSleeps(babyId, fetchCount),
    getRecentGrowthRecords(babyId, fetchCount),
    getRecentAttendedAppointments(babyId, fetchCount),
  ]);

  const activities: HistoryActivity[] = [
    ...feedings.map(formatFeedingActivity),
    ...diapers.map(formatDiaperActivity),
    ...sleeps.map(formatSleepActivity),
    ...growth.map(formatGrowthActivity),
    ...appointments.map(formatAppointmentActivity),
  ];

  activities.sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  return {
    activities: activities.slice(offset, offset + limit),
    hasMore: activities.length > offset + limit,
  };
}

export async function getWeeklyStats(
  babyId: string
): Promise<WeeklyStat[]> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const endOfTodayUtc = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  const oneWeekAgoDate = new Date(now);
  oneWeekAgoDate.setDate(oneWeekAgoDate.getDate() - 7);
  const weekYear = oneWeekAgoDate.getFullYear();
  const weekMonth = oneWeekAgoDate.getMonth();
  const weekDay = oneWeekAgoDate.getDate();
  const startOfWeekUtc = new Date(Date.UTC(weekYear, weekMonth, weekDay, 0, 0, 0, 0));

  const [thisWeekFeedings, thisWeekSleeps, thisWeekDiapers] = await Promise.all([
    getReportFeedings(babyId, startOfWeekUtc, endOfTodayUtc),
    getReportSleeps(babyId, startOfWeekUtc, endOfTodayUtc),
    getReportDiapers(babyId, startOfWeekUtc, endOfTodayUtc),
  ]);

  const completedSleeps = thisWeekSleeps.filter((s) => s.endedAt);

  const totalSleepSeconds = completedSleeps.reduce((acc, s) => {
    return acc + (new Date(s.endedAt!).getTime() - new Date(s.startedAt).getTime()) / 1000;
  }, 0);

  const avgSleepHoursPerDay =
    completedSleeps.length > 0
      ? (totalSleepSeconds / 3600 / 7).toFixed(1)
      : "0";

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
