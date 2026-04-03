"use client";

import { motion } from "framer-motion";
import { Ruler, Plus } from "lucide-react";

interface GrowthEmptyStateProps {
  onRegister: () => void;
}

export function GrowthEmptyState({ onRegister }: GrowthEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="w-20 h-20 rounded-3xl bg-surface-container-low flex items-center justify-center mb-6 border border-outline-variant/10">
        <Ruler className="w-10 h-10 text-text-disabled" strokeWidth={1} />
      </div>

      <h3 className="font-display text-lg font-medium text-text-primary mb-2 text-center">
        Nenhuma medicao registrada
      </h3>
      <p className="font-data text-sm text-text-disabled text-center max-w-[260px] mb-8 leading-relaxed">
        Comece a registrar peso, altura e perimetro cefalico para acompanhar o crescimento
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRegister}
        className="flex items-center gap-2 px-6 py-3.5 bg-[#8EAF96] hover:bg-[#7D9F85] text-[#1E2024] font-display font-semibold rounded-2xl transition-all duration-200 shadow-xl shadow-[#8EAF96]/10"
      >
        <Plus className="w-5 h-5" strokeWidth={2} />
        Registrar primeira medicao
      </motion.button>
    </motion.div>
  );
}
