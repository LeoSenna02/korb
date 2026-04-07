import type { Baby, FeedingRecord, DiaperRecord, GrowthRecord, SleepRecord, PediatricAppointment } from "@/lib/db/types";
import type { MilestoneRecord } from "@/features/milestones/types";
import type { VaccineRecord } from "@/features/vaccines/types";

// ─── camelCase → snake_case mappers (IDB → Supabase) ─────────────────────────

export function babyToRow(r: Baby) {
  return {
    id: r.id,
    name: r.name,
    family_name: r.familyName,
    birth_date: r.birthDate,
    birth_time: r.birthTime ?? null,
    gender: r.gender,
    blood_type: r.bloodType ?? null,
    photo_url: r.photoUrl ?? null,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

export function feedingToRow(r: FeedingRecord) {
  return {
    id: r.id,
    baby_id: r.babyId,
    type: r.type,
    duration_seconds: r.durationSeconds ?? null,
    left_seconds: r.leftSeconds ?? null,
    right_seconds: r.rightSeconds ?? null,
    volume_ml: r.volumeMl ?? null,
    notes: r.notes ?? null,
    started_at: r.startedAt,
    created_at: r.createdAt,
  };
}

export function diaperToRow(r: DiaperRecord) {
  return {
    id: r.id,
    baby_id: r.babyId,
    type: r.type,
    consistency: r.consistency,
    color: r.color,
    notes: r.notes ?? null,
    changed_at: r.changedAt,
    created_at: r.createdAt,
  };
}

export function growthToRow(r: GrowthRecord) {
  return {
    id: r.id,
    baby_id: r.babyId,
    weight_kg: r.weightKg ?? null,
    height_cm: r.heightCm ?? null,
    cephalic_cm: r.cephalicCm ?? null,
    notes: r.notes ?? null,
    measured_at: r.measuredAt,
    created_at: r.createdAt,
  };
}

export function sleepToRow(r: SleepRecord) {
  return {
    id: r.id,
    baby_id: r.babyId,
    type: r.type,
    started_at: r.startedAt,
    ended_at: r.endedAt ?? null,
    notes: r.notes ?? null,
    created_at: r.createdAt,
  };
}

export function milestoneToRow(r: MilestoneRecord) {
  return {
    id: r.id,
    baby_id: r.babyId,
    milestone_id: r.milestoneId,
    category: r.category,
    name: r.name,
    description: r.description,
    expected_age_months_min: r.expectedAgeMonthsMin,
    expected_age_months_max: r.expectedAgeMonthsMax,
    actual_date: r.actualDate ?? null,
    notes: r.notes ?? null,
    is_custom: r.isCustom,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

export function vaccineToRow(r: VaccineRecord) {
  return {
    id: r.id,
    baby_id: r.babyId,
    vaccine_id: r.vaccineId,
    name: r.name,
    dose_label: r.doseLabel ?? null,
    scheduled_month: r.scheduledMonth,
    applied_date: r.appliedDate ?? null,
    applied_location: r.appliedLocation ?? null,
    notes: r.notes ?? null,
    is_custom: r.isCustom,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

export function appointmentToRow(r: PediatricAppointment) {
  return {
    id: r.id,
    baby_id: r.babyId,
    doctor_name: r.doctorName,
    location: r.location,
    reason: r.reason,
    scheduled_at: r.scheduledAt,
    status: r.status,
    pre_visit_notes: r.preVisitNotes ?? null,
    post_visit_notes: r.postVisitNotes ?? null,
    follow_up_interval_days: r.followUpIntervalDays ?? null,
    follow_up_instructions: r.followUpInstructions ?? null,
    linked_growth_id: r.linkedGrowthId ?? null,
    linked_vaccine_ids: r.linkedVaccineIds,
    attended_at: r.attendedAt ?? null,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

// ─── Table name map ───────────────────────────────────────────────────────────

export const STORE_TO_TABLE: Record<string, string> = {
  babies: "babies",
  feedings: "feedings",
  diapers: "diapers",
  growth: "growth",
  sleeps: "sleeps",
  milestones: "milestones",
  vaccines: "vaccines",
  appointments: "appointments",
};
