import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido")
    .max(254, "E-mail muito longo")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .max(128, "Senha muito longa"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome precisa ter pelo menos 2 caracteres")
      .max(80, "Nome muito longo")
      .trim()
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome não pode conter números ou caracteres especiais"),
    email: z
      .string()
      .min(1, "E-mail é obrigatório")
      .email("E-mail inválido")
      .max(254, "E-mail muito longo")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Senha precisa ter pelo menos 8 caracteres")
      .max(128, "Senha muito longa")
      .regex(/[A-Z]/, "Senha precisa ter pelo menos 1 letra maiúscula")
      .regex(/[a-z]/, "Senha precisa ter pelo menos 1 letra minúscula")
      .regex(/[0-9]/, "Senha precisa ter pelo menos 1 número")
      .regex(/[^A-Za-z0-9]/, "Senha precisa ter pelo menos 1 caractere especial"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export function formatZodError(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
