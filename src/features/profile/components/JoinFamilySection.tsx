"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Loader2, Check, Users } from "lucide-react";
import { useJoinFamily, getErrorMessage } from "@/features/baby/hooks/useJoinFamily";

interface JoinFamilySectionProps {
  userId: string;
  onSuccess?: (babyId: string) => void;
}

const item = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export function JoinFamilySection({ userId, onSuccess }: JoinFamilySectionProps) {
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { isJoining, isSuccess, error, joinFamily, reset } = useJoinFamily({
    userId,
    onSuccess,
  });

  const handleCodeChange = (value: string) => {
    const filtered = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    setCode(filtered);
    if (error) reset();
  };

  const handleSubmit = async () => {
    if (code.trim().length !== 8 || isJoining) return;
    await joinFamily(code);
  };

  const handleReset = () => {
    setCode("");
    reset();
  };

  return (
    <motion.div variants={item} initial="hidden" animate="show" className="mb-8">
      <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-4">
        Entrar em outra familia
      </h3>

      <div className="bg-surface-container-low rounded-2xl border border-surface-variant/20 p-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#D2B59D]/10 text-[#D2B59D] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0">
            <span className="font-display text-sm font-medium text-text-primary block">
              Digite o codigo de convite
            </span>
            <span className="font-data text-[11px] text-text-secondary mt-0.5 block leading-relaxed">
              Para ter acesso a outro bebe da familia.
            </span>

            <div className="mt-4 flex items-center gap-2">
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.focus()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    inputRef.current?.focus();
                  }
                }}
                className={`
                  relative flex-1 bg-surface-variant/20 rounded-xl px-4 py-2.5 flex items-center justify-center gap-0.5 cursor-text
                  ${error ? "ring-2 ring-[#D2B59D]/50" : ""}
                `}
              >
                {Array.from({ length: 8 }, (_, i) => code[i] ?? "").map((char, i) => (
                  <span
                    key={i}
                    className={`
                      font-data text-lg tracking-wider font-medium
                      ${i < code.length ? "text-text-primary" : "text-text-disabled"}
                    `}
                  >
                    {char || "_"}
                  </span>
                ))}

                <input
                  ref={inputRef}
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label="Codigo de convite da familia"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-text"
                  maxLength={8}
                  disabled={isJoining || isSuccess}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="font-data text-xs text-[#D2B59D] mt-2"
                >
                  {getErrorMessage(error)}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={code.length !== 8 || isJoining || isSuccess}
                className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {isJoining ? (
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                ) : isSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 200 }}
                  >
                    <Check className="w-4 h-4 text-[#8EAF96]" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <UserPlus className="w-4 h-4" strokeWidth={2} />
                )}
                <span className="font-data text-[10px] uppercase tracking-[0.18em]">
                  {isJoining ? "Conectando..." : isSuccess ? "Conectado!" : "Entrar"}
                </span>
              </button>

              {(isSuccess || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="font-data text-[10px] text-text-secondary hover:text-text-primary transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
