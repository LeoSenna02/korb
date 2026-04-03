"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { NotesInput } from "./NotesInput";
import { useBaby } from "@/contexts/BabyContext";
import { saveGrowth, updateGrowth } from "@/lib/db/repositories/growth";
import {
  convertDateInputToMeasuredAt,
  convertMeasuredAtToDateInputValue,
  formatWeightKgForInput,
  getTodayDateInputValue,
  parseWeightInputToKg,
  sanitizeWeightInput,
} from "@/features/dashboard/utils/growth";
import type { GrowthRecordDisplay } from "@/features/growth/types";

interface GrowthRegistrySheetProps {
  editingRecord?: GrowthRecordDisplay | null;
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

function formatMetricInputValue(value?: number) {
  return value != null ? value.toFixed(1) : "";
}

function getInitialFormState(record?: GrowthRecordDisplay | null) {
  if (!record) {
    return {
      cephalicPerimeter: "",
      height: "",
      measurementDate: getTodayDateInputValue(),
      notes: "",
      weight: "",
    };
  }

  return {
    cephalicPerimeter: formatMetricInputValue(record.cephalicCm),
    height: formatMetricInputValue(record.heightCm),
    measurementDate: convertMeasuredAtToDateInputValue(record.date),
    notes: record.notes ?? "",
    weight:
      record.weightKg != null ? formatWeightKgForInput(record.weightKg) : "",
  };
}

export function GrowthRegistrySheet({
  editingRecord = null,
  isOpen,
  onClose,
  onSaved,
}: GrowthRegistrySheetProps) {
  const { baby } = useBaby();
  const initialFormState = useMemo(
    () => getInitialFormState(editingRecord),
    [editingRecord],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [weight, setWeight] = useState(initialFormState.weight);
  const [height, setHeight] = useState(initialFormState.height);
  const [cephalicPerimeter, setCephalicPerimeter] = useState(
    initialFormState.cephalicPerimeter,
  );
  const [measurementDate, setMeasurementDate] = useState(
    initialFormState.measurementDate,
  );
  const [notes, setNotes] = useState(initialFormState.notes);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setWeight(initialFormState.weight);
    setHeight(initialFormState.height);
    setCephalicPerimeter(initialFormState.cephalicPerimeter);
    setMeasurementDate(initialFormState.measurementDate);
    setNotes(initialFormState.notes);
  }, [initialFormState, isOpen]);

  async function handleSave() {
    if (!baby) return;

    const weightKg = weight ? parseWeightInputToKg(weight) : undefined;
    const heightCm = height ? parseFloat(height) : undefined;
    const cephalicCm = cephalicPerimeter
      ? parseFloat(cephalicPerimeter)
      : undefined;

    if (!weightKg && !heightCm && !cephalicCm) return;

    setIsSaving(true);
    try {
      const payload = {
        cephalicCm,
        heightCm,
        measuredAt: convertDateInputToMeasuredAt(measurementDate),
        notes: notes.trim() || undefined,
        weightKg,
      };

      if (editingRecord) {
        await updateGrowth(editingRecord.id, payload);
      } else {
        await saveGrowth({
          babyId: baby.id,
          ...payload,
        });
      }

      onSaved?.();
      handleClose();
    } catch (err) {
      console.error("[GrowthSheet] Save error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  function handleClose() {
    setWeight(initialFormState.weight);
    setHeight(initialFormState.height);
    setCephalicPerimeter(initialFormState.cephalicPerimeter);
    setMeasurementDate(initialFormState.measurementDate);
    setNotes(initialFormState.notes);
    onClose();
  }

  function handleWeightChange(value: string) {
    setWeight(sanitizeWeightInput(value));
  }

  function handleWeightBlur() {
    const parsedWeight = parseWeightInputToKg(weight);

    if (parsedWeight == null) {
      return;
    }

    setWeight(formatWeightKgForInput(parsedWeight));
  }

  const hasAtLeastOneValue = !!(weight || height || cephalicPerimeter);
  const isEditing = editingRecord != null;
  const dateInputKey = `${editingRecord?.id ?? "new"}-${initialFormState.measurementDate}-${isOpen ? "open" : "closed"}`;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Editar Medicao" : "Registro de Crescimento"}
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
                type="text"
                inputMode="decimal"
                placeholder="Ex: 4,20"
                value={weight}
                onBlur={handleWeightBlur}
                onChange={(e) => handleWeightChange(e.target.value)}
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
            <DateInput
              key={dateInputKey}
              label=""
              name="growth-date"
              required
              initialValue={measurementDate}
              onChange={setMeasurementDate}
            />
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
            {isSaving
              ? "Salvando..."
              : isEditing
                ? "Salvar Alteracoes"
                : "Salvar Registro"}
          </button>
        </motion.div>
      </motion.div>
    </Sheet>
  );
}
