import { z } from "zod";

const bloodTypeSchema = z.enum([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);

const babySchema = z.object({
  name: z.string().min(1),
  familyName: z.string().min(1),
  birthDate: z.string().min(1),
  birthTime: z.string().optional(),
  gender: z.enum(["girl", "boy"]),
  bloodType: bloodTypeSchema.optional(),
  photoUrl: z.string().optional(),
});

const feedingRecordSchema = z.object({
  id: z.string().min(1),
  babyId: z.string().min(1),
  type: z.enum(["left", "right", "bottle", "both"]),
  durationSeconds: z.number().int().nonnegative().optional(),
  leftSeconds: z.number().int().nonnegative().optional(),
  rightSeconds: z.number().int().nonnegative().optional(),
  volumeMl: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  startedAt: z.string().min(1),
  createdAt: z.string().min(1),
});

const diaperRecordSchema = z.object({
  id: z.string().min(1),
  babyId: z.string().min(1),
  type: z.enum(["xixi", "coco", "ambos"]),
  consistency: z.enum(["liquido", "pastoso", "solido"]),
  color: z.enum(["#8B4513", "#DAA520", "#556B2F"]),
  notes: z.string().optional(),
  changedAt: z.string().min(1),
  createdAt: z.string().min(1),
});

const growthRecordSchema = z.object({
  id: z.string().min(1),
  babyId: z.string().min(1),
  weightKg: z.number().nonnegative().optional(),
  heightCm: z.number().nonnegative().optional(),
  cephalicCm: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  measuredAt: z.string().min(1),
  createdAt: z.string().min(1),
});

const sleepRecordSchema = z.object({
  id: z.string().min(1),
  babyId: z.string().min(1),
  type: z.enum(["nap", "night"]),
  startedAt: z.string().min(1),
  endedAt: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
});

const milestoneRecordSchema = z.object({
  id: z.string().min(1),
  babyId: z.string().min(1),
  milestoneId: z.string().min(1),
  category: z.enum(["motor_grossa", "motor_fina", "linguagem", "social"]),
  name: z.string().min(1),
  description: z.string().min(1),
  expectedAgeMonthsMin: z.number().nonnegative(),
  expectedAgeMonthsMax: z.number().nonnegative(),
  actualDate: z.string().optional(),
  notes: z.string().optional(),
  isCustom: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

const vaccineRecordSchema = z.object({
  id: z.string().min(1),
  babyId: z.string().min(1),
  vaccineId: z.string().min(1),
  name: z.string().min(1),
  doseLabel: z.string().optional(),
  scheduledMonth: z.number().int().nonnegative(),
  appliedDate: z.string().optional(),
  appliedLocation: z.string().optional(),
  notes: z.string().optional(),
  isCustom: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const appSettingsSchema = z.object({
  notificationsEnabled: z.boolean(),
  soundEnabled: z.boolean(),
  darkMode: z.boolean(),
  language: z.enum(["pt-BR", "en-US", "es-ES"]),
  weightUnit: z.enum(["kg", "lb"]),
  volumeUnit: z.enum(["ml", "oz"]),
});

export const babyBackupPayloadSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string().min(1),
  baby: babySchema,
  records: z.object({
    feedings: z.array(feedingRecordSchema),
    sleeps: z.array(sleepRecordSchema),
    diapers: z.array(diaperRecordSchema),
    growth: z.array(growthRecordSchema),
    milestones: z.array(milestoneRecordSchema),
    vaccines: z.array(vaccineRecordSchema).default([]),
  }),
  settings: appSettingsSchema,
});
