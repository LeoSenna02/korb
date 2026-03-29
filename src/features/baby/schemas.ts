import { z } from "zod";

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const babyRegistrationSchema = z.object({
  babyName: z.string().min(1, "Nome do bebê é obrigatório"),
  birthDate: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .refine(
      (val) => {
        const [year, month, day] = val.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date <= today;
      },
      {
        message: "Data de nascimento não pode ser no futuro",
      }
    ),
  birthTime: z.string().optional(),
  gender: z.enum(["girl", "boy"], {
    message: "Gênero é obrigatório",
  }),
  familyName: z.string().min(1, "Sobrenome da família é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  bloodType: z.enum(BLOOD_TYPES).optional(),
});

export type BabyRegistrationInput = z.infer<typeof babyRegistrationSchema>;
