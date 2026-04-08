// Sync repository barrel — same interface as lib/db/repositories/
// All writes go through IndexedDB first, then sync to Supabase

export * from "./baby";
export * from "./feeding";
export * from "./diaper";
export * from "./growth";
export * from "./sleep";
export * from "./milestone";
export * from "./vaccine";
export * from "./appointment";
export * from "./symptom";

// Pass-through re-exports for read-only aggregations (no writes, no sync needed)
export {
  getRecentActivities,
} from "@/lib/db/repositories/activity";

export {
  getAllActivitiesForHistory,
  getHistoryPage,
  getWeeklyStats,
} from "@/lib/db/repositories/history";

export {
  getReportFeedings,
  getReportSleeps,
  getReportDiapers,
  getReportGrowth,
} from "@/lib/db/repositories/reports";

export {
  buildReportSummary,
  buildFeedingByHour,
  buildSleepPeriods,
  buildDiaperBreakdown,
  buildGrowthSeries,
  buildTrendComparisons,
  buildMilestones,
  buildInsights,
} from "@/lib/db/repositories/report-aggregations";

export {
  getRecordCounts,
  type RecordCounts,
} from "@/lib/db/repositories/stats";
