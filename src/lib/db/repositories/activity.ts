import type { ActivityRecord } from "../types";
import { getRecentFeedings } from "./feeding";
import { getRecentDiapers } from "./diaper";
import { getRecentGrowthRecords } from "./growth";

export async function getRecentActivities(
  babyId: string,
  limit: number
): Promise<ActivityRecord[]> {
  const fetchCount = Math.min(limit * 3, 50);

  const [feedings, diapers, growth] = await Promise.all([
    getRecentFeedings(babyId, fetchCount),
    getRecentDiapers(babyId, fetchCount),
    getRecentGrowthRecords(babyId, fetchCount),
  ]);

  const activities: ActivityRecord[] = [
    ...feedings.map((r) => ({ ...r, activityType: "feeding" as const })),
    ...diapers.map((r) => ({ ...r, activityType: "diaper" as const })),
    ...growth.map((r) => ({ ...r, activityType: "growth" as const })),
  ];

  activities.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return activities.slice(0, limit);
}
