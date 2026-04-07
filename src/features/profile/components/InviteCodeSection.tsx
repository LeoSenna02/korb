"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, UserPlus, Loader2 } from "lucide-react";
import { useInviteCode } from "../hooks/useInviteCode";

interface InviteCodeSectionProps {
  babyId: string;
  userId: string;
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

export function InviteCodeSection({ babyId, userId }: InviteCodeSectionProps) {
  const { code, isLoading, isGenerating, hasCode, generateCode } = useInviteCode({
    babyId,
    userId,
  });
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <motion.div variants={item} className="mb-8">
        <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-4">
          Convite
        </h3>
        <div className="bg-surface-container-low rounded-2xl border border-surface-variant/20 p-4">
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-text-disabled border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={item} className="mb-8">
      <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-4">
        Convite
      </h3>

      <div className="bg-surface-container-low rounded-2xl border border-surface-variant/20 p-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#88AFC7]/10 text-[#88AFC7] flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0">
            <span className="font-display text-sm font-medium text-text-primary block">
              Codigo de convite
            </span>
            <span className="font-data text-[11px] text-text-secondary mt-0.5 block leading-relaxed">
              Compartilhe este codigo para convidar cuidadores do bebe.
            </span>

            {hasCode ? (
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 bg-surface-variant/20 rounded-xl px-4 py-2.5">
                  <span className="font-data text-lg tracking-[0.2em] font-medium text-text-primary">
                    {code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-10 h-10 rounded-xl bg-surface-variant/20 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-variant/40 transition-colors shrink-0"
                  aria-label="Copiar codigo"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#8EAF96]" strokeWidth={2.5} />
                  ) : (
                    <Copy className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={generateCode}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <UserPlus className="w-4 h-4" strokeWidth={2} />
                  )}
                  <span className="font-data text-[10px] uppercase tracking-[0.18em]">
                    Gerar codigo
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
