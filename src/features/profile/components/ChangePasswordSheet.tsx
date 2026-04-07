"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check, AlertCircle, X } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { useAuthContext } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface Requirement {
  label: string;
  met: boolean;
}

function getPasswordRequirements(password: string): Requirement[] {
  return [
    { label: "Minimo 8 caracteres", met: password.length >= 8 },
    { label: "Letra maiuscula", met: /[A-Z]/.test(password) },
    { label: "Letra minuscula", met: /[a-z]/.test(password) },
    { label: "Numero", met: /[0-9]/.test(password) },
    { label: "Caractere especial", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

function PasswordStrength({ password }: { password: string }) {
  const requirements = useMemo(() => getPasswordRequirements(password), [password]);
  const metCount = requirements.filter((r) => r.met).length;

  if (!password) return null;

  const strengthPercent = (metCount / requirements.length) * 100;
  const strengthColor =
    metCount <= 1 ? "#CD8282" : metCount <= 3 ? "#D2B59D" : "#8EAF96";
  const strengthLabel =
    metCount <= 1 ? "Fraca" : metCount <= 3 ? "Media" : "Forte";

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-3"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-data text-[10px] text-text-disabled uppercase tracking-wider">
          Forca
        </span>
        <span
          className="font-data text-[10px] font-medium uppercase tracking-wider"
          style={{ color: strengthColor }}
        >
          {strengthLabel}
        </span>
      </div>

      <div className="flex gap-1.5 mb-3">
        {requirements.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < metCount ? strengthColor : "var(--color-surface-variant)",
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {requirements.map((req) => (
          <div key={req.label} className="flex items-center gap-2">
            {req.met ? (
              <Check className="w-3 h-3 text-[#8EAF96] flex-shrink-0" strokeWidth={2} />
            ) : (
              <X className="w-3 h-3 text-text-disabled flex-shrink-0" strokeWidth={2} />
            )}
            <span
              className={`font-data text-[11px] transition-colors duration-200 ${
                req.met ? "text-[#8EAF96]" : "text-text-disabled"
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

interface ChangePasswordSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordSheet({ isOpen, onClose }: ChangePasswordSheetProps) {
  const { user } = useAuthContext();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setError(null);
    setSuccess(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    if (!user) return;

    setError(null);

    if (!currentPassword) {
      setError("Informe a senha atual");
      return;
    }

    const requirements = getPasswordRequirements(newPassword);
    if (!requirements.every((r) => r.met)) {
      setError("A nova senha nao atende todos os requisitos");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas nao coincidem");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();

      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setError("Senha atual incorreta");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setError("Erro ao alterar senha. Tente novamente.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch {
      setError("Erro ao alterar senha. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Alterar Senha"
      subtitle="SEGURANCA DA CONTA"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 pb-8"
      >
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8"
          >
            <div className="w-14 h-14 rounded-full bg-[#8EAF96]/20 flex items-center justify-center mb-4">
              <Check className="w-7 h-7 text-[#8EAF96]" strokeWidth={2} />
            </div>
            <span className="font-display text-lg font-medium text-text-primary">
              Senha alterada
            </span>
            <span className="font-data text-xs text-text-secondary mt-1">
              Sua senha foi atualizada com sucesso
            </span>
          </motion.div>
        ) : (
          <>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#CD8282]/10 border border-[#CD8282]/20"
              >
                <AlertCircle className="w-4 h-4 text-[#CD8282] flex-shrink-0" strokeWidth={1.5} />
                <span className="font-data text-xs text-[#CD8282]">{error}</span>
              </motion.div>
            )}

            <div className="flex flex-col gap-2">
              <label className="font-data text-xs text-text-secondary uppercase tracking-wider">
                Senha atual
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 bg-surface-container text-text-primary font-data text-sm rounded-xl placeholder:text-text-placeholder border-b-2 border-transparent focus:border-primary focus:outline-none transition-colors duration-200"
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-data text-xs text-text-secondary uppercase tracking-wider">
                Nova senha
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 bg-surface-container text-text-primary font-data text-sm rounded-xl placeholder:text-text-placeholder border-b-2 border-transparent focus:border-primary focus:outline-none transition-colors duration-200"
                  placeholder="Minimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              <PasswordStrength password={newPassword} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-data text-xs text-text-secondary uppercase tracking-wider">
                Confirmar nova senha
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 bg-surface-container text-text-primary font-data text-sm rounded-xl placeholder:text-text-placeholder border-b-2 border-transparent focus:border-primary focus:outline-none transition-colors duration-200"
                  placeholder="Repita a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full h-16 bg-[#8EAF96] hover:bg-[#7D9F85] active:scale-[0.98] text-[#1E2024] font-display font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-[#8EAF96]/10 disabled:opacity-50"
            >
              <Check className="w-6 h-6" strokeWidth={2.5} />
              {isSaving ? "Alterando..." : "Alterar Senha"}
            </button>
          </>
        )}
      </motion.div>
    </Sheet>
  );
}
