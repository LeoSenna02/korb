"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { BloodTypeSelector } from "@/components/ui/BloodTypeSelector";
import { useBaby } from "@/contexts/BabyContext";
import type { BloodType } from "@/lib/db/types";

interface BabyEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BabyEditSheet({ isOpen, onClose }: BabyEditSheetProps) {
  const { baby, updateBaby, refreshBaby } = useBaby();
  const [isSaving, setIsSaving] = useState(false);
  const [bloodType, setBloodType] = useState<BloodType | undefined>(
    baby?.bloodType
  );

  useEffect(() => {
    if (isOpen && baby) {
      setBloodType(baby.bloodType);
    }
  }, [isOpen, baby]);

  async function handleSave() {
    if (!baby) return;
    setIsSaving(true);
    try {
      await updateBaby({ bloodType });
      await refreshBaby();
      onClose();
    } catch (err) {
      console.error("[BabyEditSheet] Update error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Bebê"
      subtitle="INFORMAÇÕES DO BEBÊ"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-8 pb-8"
      >
        <BloodTypeSelector
          label="TIPO SANGUÍNEO"
          name="bloodType"
          value={bloodType}
          onChange={setBloodType}
        />

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-16 bg-[#8EAF96] hover:bg-[#7D9F85] active:scale-[0.98] text-[#1E2024] font-display font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-[#8EAF96]/10 disabled:opacity-50"
        >
          <Check className="w-6 h-6" strokeWidth={2.5} />
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </motion.div>
    </Sheet>
  );
}
