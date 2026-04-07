"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/auth/validation";
import type { AuthResult, AuthError } from "@/lib/auth/types";
import type { LoginInput, RegisterInput } from "@/lib/auth/validation";

/**
 * Server Action para login com validação Zod server-side.
 * Garante que mesmo que a validação cliente seja bypassada,
 * o servidor ainda valida os dados antes de autenticar.
 */
export async function loginAction(input: LoginInput): Promise<AuthResult | AuthError> {
  // Validação Zod server-side (obrigatória)
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      code: "INVALID_EMAIL",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const validatedInput: LoginInput = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: validatedInput.email,
    password: validatedInput.password,
  });

  if (error) {
    return mapSupabaseError(error.message);
  }

  if (!data.user) {
    return { code: "UNKNOWN_ERROR", message: "Erro ao autenticar usuário" };
  }

  // Refresh session cookies
  const cookieStore = await cookies();
  const session = data.session;
  if (session) {
    cookieStore.set("sb-access-token", session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    cookieStore.set("sb-refresh-token", session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return {
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? "",
      name: (data.user.user_metadata?.name as string | undefined) ?? "",
      createdAt: data.user.created_at,
    },
    session: {
      userId: data.user.id,
      token: session?.access_token ?? "",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      refreshToken: session?.refresh_token ?? "",
    },
  };
}

/**
 * Server Action para registro com validação Zod server-side.
 * Valida dados de entrada antes de criar conta no Supabase.
 */
export async function registerAction(input: RegisterInput): Promise<AuthResult | AuthError> {
  // Validação Zod server-side (obrigatória)
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      code: "INVALID_EMAIL",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const validatedInput: RegisterInput = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: validatedInput.email,
    password: validatedInput.password,
    options: {
      data: {
        name: validatedInput.name,
      },
    },
  });

  if (error) {
    return mapSupabaseError(error.message);
  }

  if (!data.user) {
    return {
      code: "UNKNOWN_ERROR",
      message: "Erro ao criar conta. Verifique seu e-mail.",
    };
  }

  // Refresh session cookies
  const cookieStore = await cookies();
  const session = data.session;
  if (session) {
    cookieStore.set("sb-access-token", session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("sb-refresh-token", session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return {
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? "",
      name: validatedInput.name,
      createdAt: data.user.created_at,
    },
    session: {
      userId: data.user.id,
      token: session?.access_token ?? "",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      refreshToken: session?.refresh_token ?? "",
    },
  };
}

/**
 * Server Action para logout seguro.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Limpar cookies
  const cookieStore = await cookies();
  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");

  redirect("/login");
}

/**
 * Mapeia erros do Supabase para AuthError do app.
 */
function mapSupabaseError(message: string): AuthError {
  if (
    message.includes("Invalid login credentials") ||
    message.includes("invalid_credentials")
  ) {
    return { code: "INVALID_PASSWORD", message: "E-mail ou senha incorretos" };
  }
  if (
    message.includes("User already registered") ||
    message.includes("already_exists")
  ) {
    return {
      code: "EMAIL_ALREADY_EXISTS",
      message: "Este e-mail já está cadastrado",
    };
  }
  if (message.includes("Email not confirmed")) {
    return {
      code: "INVALID_EMAIL",
      message: "E-mail não verificado. Verifique sua caixa de entrada.",
    };
  }
  return { code: "UNKNOWN_ERROR", message: "Erro inesperado. Tente novamente." };
}
