"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, Play, Pause } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { FeedingTypeSelector } from "./FeedingTypeSelector";
import { DualTimer } from "./FeedingTimer";
import { NotesInput } from "./NotesInput";
import { useBaby } from "@/contexts/BabyContext";
import { saveFeeding } from "@/lib/db/repositories/feeding";
import { useFeedingTimer } from "../hooks/useFeedingTimer";
import { VolumeInput } from "./VolumeInput";

interface FeedingRegistrySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09 },
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

export function FeedingRegistrySheet({ isOpen, onClose, onSaved }: FeedingRegistrySheetProps) {
  const { baby } = useBaby();
  const [isSaving, setIsSaving] = useState(false);
  const [type, setType] = useState<"left" | "right" | "bottle" | "both">("both");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [volumeMl, setVolumeMl] = useState(0);

  const {
    leftSeconds,
    rightSeconds,
    activeSide,
    isActive,
    start,
    pause,
    reset,
    switchSide,
  } = useFeedingTimer();

  const durationSeconds = leftSeconds + rightSeconds;

  async function handleSave() {
    if (!baby) return;
    setIsSaving(true);
    try {
      let finalType = type;
      if (type === "both") {
        if (leftSeconds > 0 && rightSeconds > 0) finalType = "both";
        else if (leftSeconds > 0) finalType = "left";
        else if (rightSeconds > 0) finalType = "right";
      }

      await saveFeeding({
        babyId: baby.id,
        type: finalType,
        durationSeconds: finalType === "bottle" ? undefined : (durationSeconds || undefined),
        leftSeconds: finalType === "both" ? (leftSeconds || undefined) : undefined,
        rightSeconds: finalType === "both" ? (rightSeconds || undefined) : undefined,
        volumeMl: finalType === "bottle" ? (volumeMl || undefined) : undefined,
        notes: notes.trim() || undefined,
        startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      });
      reset();
      onSaved?.();
      onClose();
    } catch (err) {
      console.error("[FeedingSheet] Save error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  function handleClose() {
    onClose();
  }

  function handleReset() {
    reset();
    setNotes("");
    setShowNotes(false);
    setVolumeMl(0);
  }

  const isDual = type === "both";
  const isBottle = type === "bottle";

  function toggleTimer() {
    if (isActive) {
      pause();
    } else {
      start();
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Registro de Mamada"
      subtitle={type === "both" ? "Acompanhe um ou ambos os seios" : "Inicie o timer da mamadeira"}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.section variants={section}>
          <FeedingTypeSelector value={type} onChange={setType} />
        </motion.section>

        <motion.section variants={section}>
          {isBottle ? (
            <VolumeInput value={volumeMl} onChange={setVolumeMl} />
          ) : isDual ? (
            <DualTimer
              leftSeconds={leftSeconds}
              rightSeconds={rightSeconds}
              activeSide={activeSide}
              isActive={isActive}
              onToggle={toggleTimer}
              onSwitch={switchSide}
              onReset={handleReset}
            />
          ) : (
            <div className="flex flex-col items-center py-12">
              <span className="font-display text-6xl text-text-primary mb-8 tracking-tight">
                {String(Math.floor(durationSeconds / 3600)).padStart(2, "0")}:
                {String(Math.floor((durationSeconds % 3600) / 60)).padStart(2, "0")}:
                {String(durationSeconds % 60).padStart(2, "0")}
              </span>
              <button
                onClick={toggleTimer}
                className="w-24 h-24 rounded-full bg-surface-variant/30 border border-outline-variant/20 flex items-center justify-center text-primary hover:bg-surface-variant/50 transition-all active:scale-95"
              >
                {isActive ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>
            </div>
          )}
        </motion.section>

        <motion.section variants={section}>
          {!showNotes ? (
            <button
              onClick={() => setShowNotes(true)}
              className="w-full flex items-center justify-between py-6 border-y border-outline-variant/10 mb-8 group"
            >
              <span className="font-display text-lg text-text-primary font-medium group-hover:text-primary transition-colors">
                Adicionar notas
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-variant/20 flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-all">
                <Plus className="w-5 h-5" />
              </div>
            </button>
          ) : (
            <section className="mb-8">
              <label className="font-data text-[11px] text-text-secondary uppercase tracking-[0.15em] mb-3 block">
                OBSERVAÇÕES
              </label>
              <NotesInput value={notes} onChange={setNotes} />
            </section>
          )}
        </motion.section>

        <motion.div variants={section} className="pb-8">
          <button
            onClick={handleSave}
            disabled={isSaving || (durationSeconds === 0 && volumeMl === 0)}
            className="w-full h-16 bg-primary hover:bg-primary/90 active:scale-[0.98] text-on-primary font-display font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-primary/10 disabled:opacity-50"
          >
            <Check className="w-6 h-6 strokeWidth={2.5}" />
            {isSaving ? "Salvando..." : "Salvar Registro"}
          </button>
        </motion.div>
      </motion.div>
    </Sheet>
  );
}