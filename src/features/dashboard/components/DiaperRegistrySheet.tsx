"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import type { DiaperType, Consistency, DiaperColor } from "../types";
import { DiaperTypeSelector } from "./DiaperTypeSelector";
import { ConsistencySlider } from "./ConsistencySlider";
import { ColorPicker } from "./ColorPicker";
import { NotesInput } from "./NotesInput";
import { useBaby } from "@/contexts/BabyContext";
import { saveDiaper } from "@/lib/sync/repositories/diaper";

interface DiaperRegistrySheetProps {
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

export function DiaperRegistrySheet({ isOpen, onClose, onSaved }: DiaperRegistrySheetProps) {
  const { baby } = useBaby();
  const [isSaving, setIsSaving] = useState(false);
  const [type, setType] = useState<DiaperType>("coco");
  const [consistency, setConsistency] = useState<Consistency>("pastoso");
  const [color, setColor] = useState<DiaperColor>("#8B4513");
  const [notes, setNotes] = useState("");

  async function handleSave() {
    if (!baby) return;
    setIsSaving(true);
    try {
      await saveDiaper({
        babyId: baby.id,
        type,
        consistency,
        color,
        notes: notes.trim() || undefined,
        changedAt: new Date().toISOString(),
      });
      onSaved?.();
      handleClose();
    } catch (err) {
      console.error("[DiaperSheet] Save error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  function handleClose() {
    setType("coco");
    setConsistency("pastoso");
    setColor("#8B4513");
    setNotes("");
    onClose();
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Registro de Fralda"
      subtitle="STATUS DO BEBÊ"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.section variants={section} className="mb-8">
          <SectionLabel>TIPO DE OCORRÊNCIA</SectionLabel>
          <DiaperTypeSelector value={type} onChange={setType} />
        </motion.section>

        {type !== "xixi" && (
          <motion.section variants={section} className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <SectionLabel>CONSISTÊNCIA</SectionLabel>
              <span className="font-data text-[11px] text-primary uppercase font-bold tracking-wider bg-primary/10 px-3 py-1 rounded-full">
                {consistency}
              </span>
            </div>
            <ConsistencySlider value={consistency} onChange={setConsistency} />
          </motion.section>
        )}

        {type !== "xixi" && (
          <motion.section variants={section} className="mb-10">
            <SectionLabel>COR</SectionLabel>
            <ColorPicker value={color} onChange={setColor} />
          </motion.section>
        )}

        <motion.section variants={section} className="mb-12">
          <SectionLabel>OBSERVAÇÕES</SectionLabel>
          <NotesInput value={notes} onChange={setNotes} />
        </motion.section>

        <motion.div variants={section} className="pb-8">
          <button
            onClick={handleSave}
            disabled={isSaving}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-data text-[11px] text-text-secondary uppercase tracking-[0.15em] mb-4 block">
      {children}
    </label>
  );
}