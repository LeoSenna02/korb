import { z } from "zod";

const sleepSessionBabyIdSchema = z.string().uuid("Bebe invalido.");
const sleepSessionNotesSchema = z
  .string()
  .trim()
  .max(1000, "Observacoes muito longas.")
  .optional()
  .transform((value) => value || undefined);

export const startSleepSessionSchema = z.object({
  babyId: sleepSessionBabyIdSchema,
  type: z.enum(["nap", "night"]),
});

export const sleepSessionCommandSchema = z.object({
  babyId: sleepSessionBabyIdSchema,
});

export const completeSleepSessionSchema = z.object({
  babyId: sleepSessionBabyIdSchema,
  notes: sleepSessionNotesSchema,
});

export type StartSleepSessionInput = z.infer<typeof startSleepSessionSchema>;
export type SleepSessionCommandInput = z.infer<typeof sleepSessionCommandSchema>;
export type CompleteSleepSessionInput = z.infer<typeof completeSleepSessionSchema>;
