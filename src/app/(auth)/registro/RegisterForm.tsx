"use client";

import { useState, useTransition, useCallback } from "react";
import { Check } from "lucide-react";
import { useAuth } from "@/lib/auth/hooks";
import { registerSchema, formatZodError } from "@/lib/auth/validation";
import type { AuthError } from "@/lib/auth/types";
import type { RegisterInput } from "@/lib/auth/validation";
import { FormField } from "@/components/ui/FormField";
import { PasswordVisibilityToggle } from "@/components/ui/PasswordVisibilityToggle";
import { AuthErrorBanner } from "@/components/ui/AuthErrorBanner";
import { AuthSubmitButton } from "@/components/ui/AuthSubmitButton";

// ─── Password Strength Indicator ─────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const rules = [
    { label: "8+ caracteres", ok: password.length >= 8 },
    { label: "Maiúscula", ok: /[A-Z]/.test(password) },
    { label: "Minúscula", ok: /[a-z]/.test(password) },
    { label: "Número", ok: /[0-9]/.test(password) },
    { label: "Especial", ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = rules.filter((r) => r.ok).length;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`
              h-0.5 flex-1 rounded-full transition-all duration-300
              ${level <= score
                ? score <= 2 ? "bg-[#CD8282]" : score <= 3 ? "bg-[#D2B59D]" : "bg-primary"
                : "bg-surface-variant/40"
              }
            `}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {rules.map((rule) => (
          <span
            key={rule.label}
            className={`flex items-center gap-1 font-data text-[9px] transition-colors duration-200 ${
              rule.ok ? "text-primary" : "text-text-disabled"
            }`}
          >
            <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
            {rule.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Register Form ───────────────────────────────────────────────────────────

export function RegisterForm() {
  const { register } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

      const parsed = registerSchema.safeParse(form);
      if (!parsed.success) {
        setErrors(formatZodError(parsed.error));
        return;
      }

      const input: RegisterInput = parsed.data;

      startTransition(async () => {
        const result = await register(input);
        if ("code" in result) {
          setAuthError(result.message);
        }
      });
    },
    [form, register]
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <AuthErrorBanner message={authError} />

      <FormField label="Nome completo" id="name" error={errors.name} disabled={isPending}>
        <input
          type="text"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Marina Silva"
          className="bg-surface-container-low"
        />
      </FormField>

      <FormField label="E-mail" id="email" error={errors.email} disabled={isPending}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={form.email}
          onChange={handleChange}
          placeholder="marina@email.com"
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
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          placeholder="Mínimo 8 caracteres"
          className="bg-surface-container-low"
        />
      </FormField>

      {form.password.length > 0 && <PasswordStrength password={form.password} />}

      <FormField
        label="Confirmar senha"
        id="confirmPassword"
        error={errors.confirmPassword}
        disabled={isPending}
        rightElement={
          <PasswordVisibilityToggle
            isVisible={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            disabled={isPending}
          />
        }
      >
        <input
          type={showConfirm ? "text" : "password"}
          name="confirmPassword"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          className="bg-surface-container-low"
        />
      </FormField>

      <AuthSubmitButton
        loadingText="Criando conta..."
        defaultText="Criar conta"
        isPending={isPending}
      />
    </form>
  );
}
