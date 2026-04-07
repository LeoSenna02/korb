import { z } from "zod";

const optionalStringSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

const requiredStringSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).trim())
  .pipe(z.string().min(1));

const optionalNumberSchema = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null || value === "") {
      return undefined;
    }

    const parsed =
      typeof value === "number" ? value : Number(String(value).replace(",", "."));

    return Number.isFinite(parsed) ? parsed : undefined;
  });

const nonNegativeOptionalNumberSchema = optionalNumberSchema.refine(
  (value) => value == null || value >= 0,
  "Numero invalido"
);

const positiveOptionalIntegerSchema = optionalNumberSchema.refine(
  (value) => value == null || (Number.isInteger(value) && value > 0),
  "Numero invalido"
);

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
  name: requiredStringSchema,
  familyName: optionalStringSchema.transform((value) => value ?? ""),
  birthDate: requiredStringSchema,
  birthTime: optionalStringSchema,
  gender: z
    .union([
      z.enum(["girl", "boy"]),
      z.enum(["female", "male"]),
    ])
    .transform((value) => (value === "female" ? "girl" : value === "male" ? "boy" : value)),
  bloodType: z.union([bloodTypeSchema, z.null(), z.undefined()]).transform((value) => value ?? undefined),
  photoUrl: optionalStringSchema,
});

const feedingRecordSchema = z.object({
  id: optionalStringSchema.transform((value) => value ?? "legacy-feeding"),
  babyId: optionalStringSchema.transform((value) => value ?? "legacy-baby"),
  type: z.enum(["left", "right", "bottle", "both"]),
  durationSeconds: nonNegativeOptionalNumberSchema.refine(
    (value) => value == null || Number.isInteger(value),
    "Numero invalido"
  ),
  leftSeconds: nonNegativeOptionalNumberSchema.refine(
    (value) => value == null || Number.isInteger(value),
    "Numero invalido"
  ),
  rightSeconds: nonNegativeOptionalNumberSchema.refine(
    (value) => value == null || Number.isInteger(value),
    "Numero invalido"
  ),
  volumeMl: nonNegativeOptionalNumberSchema,
  notes: optionalStringSchema,
  startedAt: requiredStringSchema,
  createdAt: requiredStringSchema,
});

const diaperRecordSchema = z.object({
  id: optionalStringSchema.transform((value) => value ?? "legacy-diaper"),
  babyId: optionalStringSchema.transform((value) => value ?? "legacy-baby"),
  type: z.enum(["xixi", "coco", "ambos"]),
  consistency: z.enum(["liquido", "pastoso", "solido"]),
  color: z.enum(["#8B4513", "#DAA520", "#556B2F"]),
  notes: optionalStringSchema,
  changedAt: requiredStringSchema,
  createdAt: requiredStringSchema,
});

const growthRecordSchema = z.object({
  id: optionalStringSchema.transform((value) => value ?? "legacy-growth"),
  babyId: optionalStringSchema.transform((value) => value ?? "legacy-baby"),
  weightKg: nonNegativeOptionalNumberSchema,
  heightCm: nonNegativeOptionalNumberSchema,
  cephalicCm: nonNegativeOptionalNumberSchema,
  notes: optionalStringSchema,
  measuredAt: requiredStringSchema,
  createdAt: requiredStringSchema,
});

const sleepRecordSchema = z.object({
  id: optionalStringSchema.transform((value) => value ?? "legacy-sleep"),
  babyId: optionalStringSchema.transform((value) => value ?? "legacy-baby"),
  type: z.enum(["nap", "night"]),
  startedAt: requiredStringSchema,
  endedAt: optionalStringSchema,
  notes: optionalStringSchema,
  createdAt: requiredStringSchema,
});

const milestoneRecordSchema = z.object({
  id: optionalStringSchema.transform((value) => value ?? "legacy-milestone"),
  babyId: optionalStringSchema.transform((value) => value ?? "legacy-baby"),
  milestoneId: optionalStringSchema.transform((value) => value ?? "legacy-milestone-template"),
  category: z
    .string()
    .trim()
    .transform((value) => {
      const normalized = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "_");

      if (normalized === "motor_grossa") return "motor_grossa";
      if (normalized === "motor_fina") return "motor_fina";
      if (normalized === "linguagem") return "linguagem";
      return "social";
    }),
  name: requiredStringSchema,
  description: optionalStringSchema.transform((value) => value ?? ""),
  expectedAgeMonthsMin: optionalNumberSchema.transform((value) => value ?? 0),
  expectedAgeMonthsMax: optionalNumberSchema.transform((value) => value ?? 0),
  actualDate: optionalStringSchema,
  notes: optionalStringSchema,
  isCustom: z.boolean(),
  createdAt: requiredStringSchema,
  updatedAt: requiredStringSchema,
});

const vaccineRecordSchema = z.object({
  id: optionalStringSchema.transform((value) => value ?? "legacy-vaccine"),
  babyId: optionalStringSchema.transform((value) => value ?? "legacy-baby"),
  vaccineId: optionalStringSchema.transform((value) => value ?? "legacy-vaccine-template"),
  name: requiredStringSchema,
  doseLabel: optionalStringSchema,
  scheduledMonth: optionalNumberSchema.transform((value) => value ?? 0),
  appliedDate: optionalStringSchema,
  appliedLocation: optionalStringSchema,
  notes: optionalStringSchema,
  isCustom: z.boolean(),
  createdAt: requiredStringSchema,
  updatedAt: requiredStringSchema,
});

const appointmentRecordSchema = z.object({
  id: optionalStringSchema.transform((value) => value ?? "legacy-appointment"),
  babyId: optionalStringSchema.transform((value) => value ?? "legacy-baby"),
  doctorName: requiredStringSchema,
  location: requiredStringSchema,
  reason: requiredStringSchema,
  scheduledAt: requiredStringSchema,
  status: z.enum(["scheduled", "attended"]),
  preVisitNotes: optionalStringSchema,
  postVisitNotes: optionalStringSchema,
  followUpIntervalDays: positiveOptionalIntegerSchema,
  followUpInstructions: optionalStringSchema,
  linkedGrowthId: optionalStringSchema,
  linkedVaccineIds: z.array(z.string()).nullish().transform((value) => value ?? []),
  attendedAt: optionalStringSchema,
  createdAt: requiredStringSchema,
  updatedAt: requiredStringSchema,
});

export const appSettingsSchema = z.object({
  notificationsEnabled: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  darkMode: z.boolean().default(true),
  language: z.enum(["pt-BR", "en-US", "es-ES"]).default("pt-BR"),
  weightUnit: z.enum(["kg", "lb"]).default("kg"),
  volumeUnit: z.enum(["ml", "oz"]).default("ml"),
});

export const babyBackupPayloadSchema = z.object({
  schemaVersion: z.union([z.literal(1), z.undefined()]).transform(() => 1 as const),
  exportedAt: requiredStringSchema,
  baby: babySchema,
  records: z.object({
    feedings: z.array(feedingRecordSchema).default([]),
    sleeps: z.array(sleepRecordSchema).default([]),
    diapers: z.array(diaperRecordSchema).default([]),
    growth: z.array(growthRecordSchema).default([]),
    milestones: z.array(milestoneRecordSchema).default([]),
    vaccines: z.array(vaccineRecordSchema).default([]),
    appointments: z.array(appointmentRecordSchema).default([]),
  }),
  settings: appSettingsSchema.partial().default({}).transform((settings) =>
    appSettingsSchema.parse(settings)
  ),
});
