import { z } from "zod";

const symptomLabelSchema = z.string().trim().min(1).max(40);

const optionalTrimmedString = z
  .string()
  .trim()
  .max(600)
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const isoDateTimeSchema = z.string().datetime();

const symptomEpisodeBaseSchema = z.object({
  babyId: z.string().min(1),
  symptoms: z
    .array(symptomLabelSchema)
    .min(1, "Selecione pelo menos um sintoma.")
    .max(8)
    .transform((symptoms) => Array.from(new Set(symptoms))),
  severity: z.enum(["leve", "moderada", "alta"]),
  status: z.enum(["active", "resolved"]),
  startedAt: isoDateTimeSchema,
  temperatureC: z.number().min(34).max(42.5).optional(),
  medication: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  notes: optionalTrimmedString,
  resolvedAt: isoDateTimeSchema.optional(),
  resolutionNotes: optionalTrimmedString,
});

export const symptomEpisodeInputSchema = symptomEpisodeBaseSchema.superRefine(
  (data, ctx) => {
    if (data.status === "resolved" && !data.resolvedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["resolvedAt"],
        message: "Informe quando o episodio foi resolvido.",
      });
    }

    if (
      data.resolvedAt &&
      new Date(data.resolvedAt).getTime() < new Date(data.startedAt).getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["resolvedAt"],
        message: "A resolucao nao pode ser anterior ao inicio.",
      });
    }
  }
);

export const symptomEpisodeUpdateSchema = symptomEpisodeBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (data.symptoms && data.symptoms.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["symptoms"],
        message: "Selecione pelo menos um sintoma.",
      });
    }
  });

export const symptomEpisodeResolveSchema = z.object({
  resolvedAt: isoDateTimeSchema,
  resolutionNotes: optionalTrimmedString,
});
