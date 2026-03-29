"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { NotesInput } from "./NotesInput";
import { useBaby } from "@/contexts/BabyContext";
import { saveGrowth } from "@/lib/db/repositories/growth";

interface GrowthRegistrySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const section = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export function GrowthRegistrySheet({ isOpen, onClose, onSaved }: GrowthRegistrySheetProps) {
  const { baby } = useBaby();
  const [isSaving, setIsSaving] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [cephalicPerimeter, setCephalicPerimeter] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSave() {
    if (!baby) return;

    const weightKg = weight ? parseFloat(weight) : undefined;
    const heightCm = height ? parseFloat(height) : undefined;
    const cephalicCm = cephalicPerimeter ? parseFloat(cephalicPerimeter) : undefined;

    if (!weightKg && !heightCm && !cephalicCm) return;

    setIsSaving(true);
    try {
      await saveGrowth({
        babyId: baby.id,
        weightKg,
        heightCm,
        cephalicCm,
        notes: notes.trim() || undefined,
        measuredAt: new Date().toISOString(),
      });
      onSaved?.();
      handleClose();
    } catch (err) {
      console.error("[GrowthSheet] Save error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  function handleClose() {
    setWeight("");
    setHeight("");
    setCephalicPerimeter("");
    setNotes("");
    onClose();
  }

  const hasAtLeastOneValue = !!(weight || height || cephalicPerimeter);

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Registro de Crescimento"
      subtitle="MEDIÇÕES DO BEBÊ"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.section variants={section} className="space-y-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                label="PESO"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-surface-container-high border-none h-14"
              />
              <span className="absolute right-4 bottom-[14px] font-data text-xs text-text-secondary uppercase">kg</span>
            </div>

            <div className="flex-1 relative">
              <Input
                label="ALTURA"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="bg-surface-container-high border-none h-14"
              />
              <span className="absolute right-4 bottom-[14px] font-data text-xs text-text-secondary uppercase">cm</span>
            </div>
          </div>

          <div className="relative">
            <Input
              label="PERÍMETRO CEFÁLICO"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={cephalicPerimeter}
              onChange={(e) => setCephalicPerimeter(e.target.value)}
              className="bg-surface-container-high border-none h-14"
            />
            <span className="absolute right-4 bottom-[14px] font-data text-xs text-text-secondary uppercase">cm</span>
          </div>

          <div className="bg-surface-container-high rounded-xl p-4">
            <label className="font-data text-[10px] text-text-secondary uppercase tracking-wider mb-2 block">DATA DA MEDIÇÃO</label>
            <DateInput label="" name="growth-date" required />
          </div>

          <div>
            <label className="font-data text-[10px] text-text-secondary uppercase tracking-wider mb-3 block">OBSERVAÇÕES</label>
            <NotesInput value={notes} onChange={setNotes} />
          </div>
        </motion.section>

        <motion.div variants={section} className="pb-8">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasAtLeastOneValue}
            className="w-full h-16 bg-primary hover:bg-primary/90 active:scale-[0.98] text-on-primary font-display font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-primary/10 disabled:opacity-50"
          >
            <Check className="w-6 h-6" strokeWidth={2.5} />
            {isSaving ? "Salvando..." : "Salvar Registro"}
          </button>
        </motion.div>
      </motion.div>
    </Sheet>
  );
}