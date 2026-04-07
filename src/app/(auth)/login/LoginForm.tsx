"use client";

import { useState, useTransition, useCallback } from "react";
import { useAuth } from "@/lib/auth/hooks";
import { loginSchema, formatZodError } from "@/lib/auth/validation";
import type { AuthError } from "@/lib/auth/types";
import type { LoginInput } from "@/lib/auth/validation";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { FormField } from "@/components/ui/FormField";
import { PasswordVisibilityToggle } from "@/components/ui/PasswordVisibilityToggle";
import { AuthErrorBanner } from "@/components/ui/AuthErrorBanner";
import { AuthSubmitButton } from "@/components/ui/AuthSubmitButton";

export function LoginForm() {
  const { login } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
      if (authError) setAuthError(null);
    },
    [errors, authError]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError(null);

      const parsed = loginSchema.safeParse(form);
      if (!parsed.success) {
        setErrors(formatZodError(parsed.error));
        return;
      }

      const input: LoginInput = parsed.data;

      startTransition(async () => {
        const result = await login(input);
        if ("code" in result) {
          setAuthError(result.message);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setIsRedirecting(true);
        }
      });
    },
    [form, login]
  );

  if (isRedirecting) {
    return <LoadingScreen />;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <AuthErrorBanner message={authError} />

      <FormField label="E-mail" id="email" error={errors.email} disabled={isPending}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={form.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          className="bg-surface-container-low"
        />
      </FormField>

      <FormField
        label="Senha"
        id="password"
        error={errors.password}
        disabled={isPending}
        rightElement={
          <PasswordVisibilityToggle
            isVisible={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            disabled={isPending}
          />
        }
      >
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="bg-surface-container-low"
        />
      </FormField>

      <AuthSubmitButton
        loadingText="Entrando..."
        defaultText="Entrar"
        isPending={isPending}
      />
    </form>
  );
}
