export { saveBaby, getBabyByUserId, getBabyById, updateBaby, deleteBaby } from "./baby";
export { saveFeeding, getFeedingsByBabyId, getRecentFeedings } from "./feeding";
export { saveDiaper, getDiapersByBabyId, getRecentDiapers } from "./diaper";
export {
  saveGrowth,
  updateGrowth,
  deleteGrowth,
  getGrowthByBabyId,
  getLatestGrowth,
  getRecentGrowthRecords,
} from "./growth";
export { saveSleep, getSleepsByBabyId, getTodaySleepRecords, getTotalSleepSecondsToday } from "./sleep";
export {
  saveMilestone,
  updateMilestone,
  getMilestonesByBabyId,
  getMilestonesByCategory,
  getMilestoneById,
  deleteMilestone,
  getMilestonesProgress,
} from "./milestone";
export { getRecentActivities } from "./activity";
export { getReportFeedings, getReportSleeps, getReportDiapers, getReportGrowth } from "./reports";
export {
  buildReportSummary,
  buildFeedingByHour,
  buildSleepPeriods,
  buildDiaperBreakdown,
  buildGrowthSeries,
  buildTrendComparisons,
  buildMilestones,
  buildInsights,
} from "./report-aggregations";
export { getRecordCounts } from "./stats";
export type { RecordCounts } from "./stats";
export { createBabyBackupSnapshot, replaceBabyDataFromBackup } from "./backup";
