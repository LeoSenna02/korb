import type { ActivityRecord, FeedingRecord, DiaperRecord, GrowthRecord } from "../types";
import { getDB } from "../index";

export async function getRecentActivities(
  babyId: string,
  limit: number
): Promise<ActivityRecord[]> {
  const db = await getDB();

  const [feedings, diapers, growth] = await Promise.all([
    db.getAllFromIndex("feedings", "byBabyId", babyId) as Promise<FeedingRecord[]>,
    db.getAllFromIndex("diapers", "byBabyId", babyId) as Promise<DiaperRecord[]>,
    db.getAllFromIndex("growth", "byBabyId", babyId) as Promise<GrowthRecord[]>,
  ]);

  const activities: ActivityRecord[] = [
    ...feedings.map((r) => ({ ...r, activityType: "feeding" as const })),
    ...diapers.map((r) => ({ ...r, activityType: "diaper" as const })),
    ...growth.map((r) => ({ ...r, activityType: "growth" as const })),
  ];

  activities.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return activities.slice(0, limit);
}
