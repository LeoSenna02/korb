"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { useAuthContext } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface EditProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileSheet({ isOpen, onClose }: EditProfileSheetProps) {
  const { user } = useAuthContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name);
      setEmail(user.email);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, user]);

  function handleClose() {
    setError(null);
    setSuccess(false);
    onClose();
  }

  async function handleSubmit() {
    if (!user) return;

    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      setError("Nome precisa ter pelo menos 2 caracteres");
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("E-mail invalido");
      return;
    }

    if (trimmedName === user.name && trimmedEmail === user.email) {
      handleClose();
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        email: trimmedEmail !== user.email ? trimmedEmail : undefined,
        data: { name: trimmedName },
      });

      if (error) {
        setError("Erro ao atualizar perfil. Tente novamente.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 1500);
    } catch {
      setError("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Perfil"
      subtitle="DADOS DA CONTA"
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
              Perfil atualizado
            </span>
            <span className="font-data text-xs text-text-secondary mt-1">
              Seus dados foram salvos com sucesso
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
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 bg-surface-container text-text-primary font-data text-sm rounded-xl placeholder:text-text-placeholder border-b-2 border-transparent focus:border-primary focus:outline-none transition-colors duration-200"
                placeholder="Seu nome"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-data text-xs text-text-secondary uppercase tracking-wider">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-surface-container text-text-primary font-data text-sm rounded-xl placeholder:text-text-placeholder border-b-2 border-transparent focus:border-primary focus:outline-none transition-colors duration-200"
                placeholder="seu@email.com"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full h-16 bg-[#8EAF96] hover:bg-[#7D9F85] active:scale-[0.98] text-[#1E2024] font-display font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-[#8EAF96]/10 disabled:opacity-50"
            >
              <Check className="w-6 h-6" strokeWidth={2.5} />
              {isSaving ? "Salvando..." : "Salvar Alteracoes"}
            </button>
          </>
        )}
      </motion.div>
    </Sheet>
  );
}
