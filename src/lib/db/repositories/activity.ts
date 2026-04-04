import type { ActivityRecord } from "../types";
import { getRecentAttendedAppointments } from "./appointment";
import { getRecentFeedings } from "./feeding";
import { getRecentDiapers } from "./diaper";
import { getRecentGrowthRecords } from "./growth";

function getActivitySortDate(record: ActivityRecord): string {
  switch (record.activityType) {
    case "feeding":
    case "diaper":
    case "growth":
      return record.createdAt;
    case "appointment":
      return record.attendedAt ?? record.updatedAt;
    default:
      return record.createdAt;
  }
}

export async function getRecentActivities(
  babyId: string,
  limit: number
): Promise<ActivityRecord[]> {
  const fetchCount = Math.min(limit * 3, 50);

  const [feedings, diapers, growth, appointments] = await Promise.all([
    getRecentFeedings(babyId, fetchCount),
    getRecentDiapers(babyId, fetchCount),
    getRecentGrowthRecords(babyId, fetchCount),
    getRecentAttendedAppointments(babyId, fetchCount),
  ]);

  const activities: ActivityRecord[] = [
    ...feedings.map((r) => ({ ...r, activityType: "feeding" as const })),
    ...diapers.map((r) => ({ ...r, activityType: "diaper" as const })),
    ...growth.map((r) => ({ ...r, activityType: "growth" as const })),
    ...appointments.map((r) => ({ ...r, activityType: "appointment" as const })),
  ];

  activities.sort((a, b) =>
    getActivitySortDate(b).localeCompare(getActivitySortDate(a))
  );
  return activities.slice(0, limit);
}
