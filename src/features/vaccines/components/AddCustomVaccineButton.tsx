"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface AddCustomVaccineButtonProps {
  onClick: () => void;
}

export function AddCustomVaccineButton({
  onClick,
}: AddCustomVaccineButtonProps) {
  return (
    <motion.button
      type="button"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      onClick={onClick}
      className="fixed bottom-8 right-6 w-14 h-14 bg-primary hover:bg-primary/90 active:scale-95 rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition-all z-40"
      style={{ boxShadow: "0 4px 24px rgba(123, 158, 135, 0.3)" }}
      aria-label="Adicionar vacina customizada"
    >
      <Plus className="w-6 h-6 text-on-primary" strokeWidth={2.5} />
    </motion.button>
  );
}
