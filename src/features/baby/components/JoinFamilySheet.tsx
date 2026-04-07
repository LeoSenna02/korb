"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Loader2, Check } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { useJoinFamily, getErrorMessage } from "../hooks/useJoinFamily";

interface JoinFamilySheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: (babyId: string) => void;
}

export function JoinFamilySheet({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: JoinFamilySheetProps) {
  const [code, setCode] = useState("");
  const { isJoining, isSuccess, error, joinFamily, reset } = useJoinFamily({
    userId,
    onSuccess,
  });

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        reset();
        setCode("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (code.trim().length !== 8 || isJoining) return;
      await joinFamily(code);
    },
    [code, isJoining, joinFamily]
  );

  const handleCodeChange = (value: string) => {
    const filtered = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    setCode(filtered);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Entrar em uma familia">
      <div className="pb-8">
        <p className="font-data text-sm text-text-secondary text-center mb-6 leading-relaxed">
          Digite o codigo de convite para ter acesso ao bebe da familia.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <div
              className={`
                bg-surface-container-high rounded-2xl p-4 flex items-center justify-center gap-1
                ${error ? "ring-2 ring-[#D2B59D]/50" : ""}
              `}
            >
              {code.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`
                    w-8 h-12 flex items-center justify-center
                    font-data text-2xl font-medium tracking-wider
                    ${i < code.length ? "text-text-primary" : "text-text-disabled"}
                    ${i === 4 ? "ml-2" : ""}
                  `}
                >
                  {char || "_"}
                </motion.span>
              ))}
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-text"
              placeholder=""
              autoFocus
              disabled={isJoining || isSuccess}
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="font-data text-xs text-[#D2B59D] text-center mb-4"
              >
                {getErrorMessage(error)}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={code.length !== 8 || isJoining || isSuccess}
            className="w-full h-14 rounded-2xl font-display font-semibold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isSuccess ? "#8EAF96" : "rgba(142, 175, 150, 0.15)",
              color: isSuccess ? "#1E2024" : "#8EAF96",
            }}
          >
            {isJoining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Conectando...</span>
              </>
            ) : isSuccess ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 200 }}
                >
                  <Check className="w-5 h-5" strokeWidth={3} />
                </motion.div>
                <span>Conectado!</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" strokeWidth={2} />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>
      </div>
    </Sheet>
  );
}
