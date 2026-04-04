import { z } from "zod";

const optionalNotesSchema = z.string().trim().max(1500).optional();
const optionalInstructionsSchema = z.string().trim().max(1000).optional();

export const attendAppointmentMeasurementsSchema = z
  .object({
    measuredAt: z.string().min(1),
    weightKg: z.number().positive("Peso deve ser maior que zero").max(30, "Peso fora da faixa esperada").optional(),
    heightCm: z.number().positive("Altura deve ser maior que zero").max(130, "Altura fora da faixa esperada").optional(),
    cephalicCm: z.number().positive("Cefalia deve ser maior que zero").max(80, "Cefalia fora da faixa esperada").optional(),
  })
  .refine(
    (values) =>
      values.weightKg != null ||
      values.heightCm != null ||
      values.cephalicCm != null,
    {
      message: "Informe pelo menos uma medida para salvar.",
      path: ["weightKg"],
    }
  );

export const attendAppointmentSubmitSchema = z.object({
  postVisitNotes: optionalNotesSchema,
  followUpIntervalDays: z.number().int().positive().max(365).optional(),
  followUpInstructions: optionalInstructionsSchema,
  growthData: attendAppointmentMeasurementsSchema.optional(),
  linkedGrowthId: z.string().min(1).optional(),
  linkedVaccineIds: z.array(z.string().min(1)).default([]),
});

export type AttendAppointmentMeasurementsInput = z.infer<
  typeof attendAppointmentMeasurementsSchema
>;

export type AttendAppointmentSubmitInput = z.infer<
  typeof attendAppointmentSubmitSchema
>;
