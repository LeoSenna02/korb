import { getDB } from "../index";
import { getFeedingsByBabyId } from "./feeding";
import { getSleepsByBabyId } from "./sleep";
import { getDiapersByBabyId } from "./diaper";
import { getGrowthByBabyId } from "./growth";

export interface RecordCounts {
  totalFeedings: number;
  totalSleeps: number;
  totalDiapers: number;
  totalGrowth: number;
}

export async function getRecordCounts(babyId: string): Promise<RecordCounts> {
  const [feedings, sleeps, diapers, growth] = await Promise.all([
    getFeedingsByBabyId(babyId),
    getSleepsByBabyId(babyId),
    getDiapersByBabyId(babyId),
    getGrowthByBabyId(babyId),
  ]);

  return {
    totalFeedings: feedings.length,
    totalSleeps: sleeps.length,
    totalDiapers: diapers.length,
    totalGrowth: growth.length,
  };
}
