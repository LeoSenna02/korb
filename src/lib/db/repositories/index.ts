export {
  saveBaby,
  getBabyByUserId,
  getBabiesByUserId,
  getBabyById,
  updateBaby,
  deleteBaby,
} from "./baby";
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
export {
  saveVaccine,
  updateVaccine,
  clearVaccineApplication,
  getVaccinesByBabyId,
  deleteVaccine,
} from "./vaccine";
export {
  saveAppointment,
  updateAppointment,
  deleteAppointment,
  markAppointmentAsAttended,
  getAppointmentsByBabyId,
  getRecentAttendedAppointments,
  getAppointmentLinkSuggestions,
} from "./appointment";
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
export {
  createBabyBackupSnapshot,
  replaceBabyDataFromBackup,
  clearBabyData,
} from "./backup";
