import { getDB } from "../index";

export interface RecordCounts {
  totalFeedings: number;
  totalSleeps: number;
  totalDiapers: number;
  totalGrowth: number;
  totalMilestones: number;
  totalVaccines: number;
  totalAppointments: number;
}

export async function getRecordCounts(babyId: string): Promise<RecordCounts> {
  const db = await getDB();

  const [txFeed, txSleep, txDiaper, txGrowth, txMilestone, txVaccine, txAppointment] = [
    db.transaction("feedings"),
    db.transaction("sleeps"),
    db.transaction("diapers"),
    db.transaction("growth"),
    db.transaction("milestones"),
    db.transaction("vaccines"),
    db.transaction("appointments"),
  ];

  const [
    totalFeedings,
    totalSleeps,
    totalDiapers,
    totalGrowth,
    totalMilestones,
    totalVaccines,
    totalAppointments,
  ] = await Promise.all([
    txFeed.store.index("byBabyId").count(babyId),
    txSleep.store.index("byBabyId").count(babyId),
    txDiaper.store.index("byBabyId").count(babyId),
    txGrowth.store.index("byBabyId").count(babyId),
    txMilestone.store.index("byBabyId").count(babyId),
    txVaccine.store.index("byBabyId").count(babyId),
    txAppointment.store.index("byBabyId").count(babyId),
  ]);

  return {
    totalFeedings,
    totalSleeps,
    totalDiapers,
    totalGrowth,
    totalMilestones,
    totalVaccines,
    totalAppointments,
  };
}
