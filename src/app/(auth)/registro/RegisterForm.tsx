"use client";

import { useState, useTransition, useCallback } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/lib/auth/hooks";
import { registerSchema, formatZodError } from "@/lib/auth/validation";
import type { AuthError } from "@/lib/auth/types";
import type { RegisterInput } from "@/lib/auth/validation";

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
      {authError && (
        <div className="flex items-start gap-3 bg-[#CD8282]/10 border border-[#CD8282]/20 rounded-2xl p-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5 text-[#CD8282] flex-shrink-0 mt-0.5"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="font-data text-[13px] text-[#CD8282] leading-relaxed">
            {authError}
          </p>
        </div>
      )}

      {/* ─── Name ──────────────────────────────────────── */}
      <div>
        <label
          htmlFor="name"
          className="block font-data text-[10px] uppercase tracking-wider text-text-disabled mb-2"
        >
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Marina Silva"
          disabled={isPending}
          className={`
            w-full bg-surface-container-low rounded-2xl px-4 py-3.5
            font-data text-sm text-text-primary
            placeholder:text-text-placeholder
            border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/40
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errors.name ? "border-[#CD8282]/50" : "border-surface-variant/30"}
          `}
        />
        {errors.name && (
          <p className="mt-1.5 font-data text-[11px] text-[#CD8282]">{errors.name}</p>
        )}
      </div>

      {/* ─── Email ─────────────────────────────────────── */}
      <div>
        <label
          htmlFor="email"
          className="block font-data text-[10px] uppercase tracking-wider text-text-disabled mb-2"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={form.email}
          onChange={handleChange}
          placeholder="marina@email.com"
          disabled={isPending}
          className={`
            w-full bg-surface-container-low rounded-2xl px-4 py-3.5
            font-data text-sm text-text-primary
            placeholder:text-text-placeholder
            border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/40
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errors.email ? "border-[#CD8282]/50" : "border-surface-variant/30"}
          `}
        />
        {errors.email && (
          <p className="mt-1.5 font-data text-[11px] text-[#CD8282]">{errors.email}</p>
        )}
      </div>

      {/* ─── Password ──────────────────────────────────── */}
      <div>
        <label
          htmlFor="password"
          className="block font-data text-[10px] uppercase tracking-wider text-text-disabled mb-2"
        >
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
            disabled={isPending}
            className={`
              w-full bg-surface-container-low rounded-2xl px-4 py-3.5 pr-12
              font-data text-sm text-text-primary
              placeholder:text-text-placeholder
              border transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/40
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.password ? "border-[#CD8282]/50" : "border-surface-variant/30"}
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors duration-200 disabled:opacity-50"
            disabled={isPending}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <Eye className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
        {form.password.length > 0 && <PasswordStrength password={form.password} />}
        {errors.password && (
          <p className="mt-1.5 font-data text-[11px] text-[#CD8282]">{errors.password}</p>
        )}
      </div>

      {/* ─── Confirm Password ──────────────────────────── */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block font-data text-[10px] uppercase tracking-wider text-text-disabled mb-2"
        >
          Confirmar senha
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={isPending}
            className={`
              w-full bg-surface-container-low rounded-2xl px-4 py-3.5 pr-12
              font-data text-sm text-text-primary
              placeholder:text-text-placeholder
              border transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/40
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.confirmPassword ? "border-[#CD8282]/50" : "border-surface-variant/30"}
            `}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors duration-200 disabled:opacity-50"
            disabled={isPending}
            tabIndex={-1}
          >
            {showConfirm ? (
              <EyeOff className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <Eye className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1.5 font-data text-[11px] text-[#CD8282]">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="
          w-full mt-6
          bg-primary text-on-primary
          rounded-2xl py-4 px-6
          font-display text-base font-semibold
          tracking-tight
          transition-all duration-300
          hover:shadow-[var(--shadow-btn-primary)]
          active:scale-[0.99]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
        "
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
            </svg>
            Criando conta...
          </span>
        ) : (
          "Criar conta"
        )}
      </button>
    </form>
  );
}
