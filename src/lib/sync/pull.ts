import type { SupabaseClient } from "@supabase/supabase-js";
import { getDB } from "@/lib/db";
import type {
  Baby,
  FeedingRecord,
  DiaperRecord,
  GrowthRecord,
  PediatricAppointment,
  SleepRecord,
} from "@/lib/db/types";
import type { MilestoneRecord } from "@/features/milestones/types";
import type { VaccineRecord } from "@/features/vaccines/types";
import { emitDataSyncEvent } from "./events";

interface PullResult {
  babies: number;
  feedings: number;
  diapers: number;
  growth: number;
  sleeps: number;
  appointments: number;
  milestones: number;
  vaccines: number;
}

export async function pullAllDataFromServer(
  supabase: SupabaseClient,
  userId: string
): Promise<PullResult> {
  const result: PullResult = {
    babies: 0,
    feedings: 0,
    diapers: 0,
    growth: 0,
    sleeps: 0,
    appointments: 0,
    milestones: 0,
    vaccines: 0,
  };

  const { data: caregiverRows, error: cgError } = await supabase
    .from("baby_caregivers")
    .select("baby_id")
    .eq("user_id", userId);

  if (cgError || !caregiverRows?.length) {
    console.warn("[pull] No caregivers found:", cgError);
    return result;
  }

  const babyIds = caregiverRows.map((r) => r.baby_id);

  const { data: babyRows, error: babiesError } = await supabase
    .from("babies")
    .select("*")
    .in("id", babyIds);

  if (babiesError || !babyRows) {
    console.warn("[pull] Error fetching babies:", babiesError);
    return result;
  }

  const babies: Baby[] = babyRows.map((r) => ({
    id: r.id,
    userId,
    name: r.name,
    familyName: r.family_name,
    birthDate: r.birth_date,
    birthTime: r.birth_time ?? undefined,
    gender: r.gender as "girl" | "boy",
    bloodType: r.blood_type as Baby["bloodType"],
    photoUrl: r.photo_url ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  const [
    feedingRes,
    diaperRes,
    growthRes,
    sleepRes,
    appointmentRes,
    milestoneRes,
    vaccineRes,
  ] = await Promise.all([
    supabase.from("feedings").select("*").in("baby_id", babyIds),
    supabase.from("diapers").select("*").in("baby_id", babyIds),
    supabase.from("growth").select("*").in("baby_id", babyIds),
    supabase.from("sleeps").select("*").in("baby_id", babyIds),
    supabase.from("appointments").select("*").in("baby_id", babyIds),
    supabase.from("milestones").select("*").in("baby_id", babyIds),
    supabase.from("vaccines").select("*").in("baby_id", babyIds),
  ]);

  const feedings: FeedingRecord[] = (feedingRes.data ?? []).map((r) => ({
    id: r.id,
    babyId: r.baby_id,
    type: r.type,
    durationSeconds: r.duration_seconds ?? undefined,
    leftSeconds: r.left_seconds ?? undefined,
    rightSeconds: r.right_seconds ?? undefined,
    volumeMl: r.volume_ml ?? undefined,
    notes: r.notes ?? undefined,
    startedAt: r.started_at,
    createdAt: r.created_at,
  }));

  const diapers: DiaperRecord[] = (diaperRes.data ?? []).map((r) => ({
    id: r.id,
    babyId: r.baby_id,
    type: r.type,
    consistency: r.consistency,
    color: r.color,
    notes: r.notes ?? undefined,
    changedAt: r.changed_at,
    createdAt: r.created_at,
  }));

  const growths: GrowthRecord[] = (growthRes.data ?? []).map((r) => ({
    id: r.id,
    babyId: r.baby_id,
    weightKg: r.weight_kg ?? undefined,
    heightCm: r.height_cm ?? undefined,
    cephalicCm: r.cephalic_cm ?? undefined,
    notes: r.notes ?? undefined,
    measuredAt: r.measured_at,
    createdAt: r.created_at,
  }));

  const sleeps: SleepRecord[] = (sleepRes.data ?? []).map((r) => ({
    id: r.id,
    babyId: r.baby_id,
    type: r.type,
    startedAt: r.started_at,
    endedAt: r.ended_at ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  }));

  const appointments: PediatricAppointment[] = (appointmentRes.data ?? []).map((r) => ({
    id: r.id,
    babyId: r.baby_id,
    doctorName: r.doctor_name,
    location: r.location,
    reason: r.reason,
    scheduledAt: r.scheduled_at,
    status: r.status as PediatricAppointment["status"],
    preVisitNotes: r.pre_visit_notes ?? undefined,
    postVisitNotes: r.post_visit_notes ?? undefined,
    followUpIntervalDays: r.follow_up_interval_days ?? undefined,
    followUpInstructions: r.follow_up_instructions ?? undefined,
    linkedGrowthId: r.linked_growth_id ?? undefined,
    linkedVaccineIds: r.linked_vaccine_ids ?? [],
    attendedAt: r.attended_at ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  const milestones: MilestoneRecord[] = (milestoneRes.data ?? []).map((r) => ({
    id: r.id,
    babyId: r.baby_id,
    milestoneId: r.milestone_id,
    category: r.category as MilestoneRecord["category"],
    name: r.name,
    description: r.description,
    expectedAgeMonthsMin: r.expected_age_months_min,
    expectedAgeMonthsMax: r.expected_age_months_max,
    actualDate: r.actual_date ?? undefined,
    notes: r.notes ?? undefined,
    isCustom: r.is_custom,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  const vaccines: VaccineRecord[] = (vaccineRes.data ?? []).map((r) => ({
    id: r.id,
    babyId: r.baby_id,
    vaccineId: r.vaccine_id,
    name: r.name,
    doseLabel: r.dose_label ?? undefined,
    scheduledMonth: r.scheduled_month,
    appliedDate: r.applied_date ?? undefined,
    appliedLocation: r.applied_location ?? undefined,
    notes: r.notes ?? undefined,
    isCustom: r.is_custom,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  const db = await getDB();

  const allRecords = [
    ...babies.map((r) => ({ store: "babies" as const, record: r })),
    ...feedings.map((r) => ({ store: "feedings" as const, record: r })),
    ...diapers.map((r) => ({ store: "diapers" as const, record: r })),
    ...growths.map((r) => ({ store: "growth" as const, record: r })),
    ...sleeps.map((r) => ({ store: "sleeps" as const, record: r })),
    ...appointments.map((r) => ({ store: "appointments" as const, record: r })),
    ...milestones.map((r) => ({ store: "milestones" as const, record: r })),
    ...vaccines.map((r) => ({ store: "vaccines" as const, record: r })),
  ];

  const storeNames = [...new Set(allRecords.map((r) => r.store))];

  const tx = db.transaction(storeNames, "readwrite");

  for (const { store, record } of allRecords) {
    tx.objectStore(store).put(record);
  }

  await tx.done;

  result.babies = babies.length;
  result.feedings = feedings.length;
  result.diapers = diapers.length;
  result.growth = growths.length;
  result.sleeps = sleeps.length;
  result.appointments = appointments.length;
  result.milestones = milestones.length;
  result.vaccines = vaccines.length;

  console.info(
    `[pull] Completed: ${result.babies} babies, ${result.feedings} feedings, ${result.diapers} diapers, ${result.growth} growth, ${result.sleeps} sleeps, ${result.appointments} appointments, ${result.milestones} milestones, ${result.vaccines} vaccines`
  );

  emitDataSyncEvent();

  return result;
}
