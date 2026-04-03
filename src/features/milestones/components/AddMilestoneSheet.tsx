"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, Trash2, XCircle } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import {
  CATEGORY_INFO,
  type MilestoneCategory,
  type MilestoneTemplate,
} from "../constants";
import type { MilestoneRecord } from "../types";
import { saveMilestone, updateMilestone, deleteMilestone } from "@/lib/db/repositories/milestone";

interface AddMilestoneSheetProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string;
  template?: MilestoneTemplate;
  existingRecord?: MilestoneRecord;
  onSave?: () => void;
}

type FormState = "edit" | "date" | "details";

export function AddMilestoneSheet({
  isOpen,
  onClose,
  babyId,
  template,
  existingRecord,
  onSave,
}: AddMilestoneSheetProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState<FormState>(
    existingRecord ? "date" : template ? "date" : "edit"
  );
  const [name, setName] = useState(existingRecord?.name || template?.name || "");
  const [category, setCategory] = useState<MilestoneCategory>(
    existingRecord?.category || template?.category || "motor_grossa"
  );
  const [description, setDescription] = useState(
    existingRecord?.description || template?.description || ""
  );
  const [ageMonthsMin, setAgeMonthsMin] = useState(
    existingRecord?.expectedAgeMonthsMin ?? template?.expectedAgeMonthsMin ?? 0
  );
  const [ageMonthsMax, setAgeMonthsMax] = useState(
    existingRecord?.expectedAgeMonthsMax ?? template?.expectedAgeMonthsMax ?? 2
  );
  const [achievedDate, setAchievedDate] = useState(existingRecord?.actualDate || "");
  const [notes, setNotes] = useState(existingRecord?.notes || "");
  const [showNotes, setShowNotes] = useState(!!existingRecord?.notes);

  const isCustom = !template || existingRecord?.isCustom;
  const isEditing = !!existingRecord;

  function resetForm() {
    setName("");
    setCategory("motor_grossa");
    setDescription("");
    setAgeMonthsMin(0);
    setAgeMonthsMax(2);
    setAchievedDate("");
    setNotes("");
    setShowNotes(false);
    setFormState("edit");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      if (isEditing && existingRecord) {
        const updates: Parameters<typeof updateMilestone>[1] = {};
        updates.actualDate = achievedDate || undefined;
        updates.notes = notes.trim() || undefined;
        await updateMilestone(existingRecord.id, updates);
      } else {
        await saveMilestone({
          id: crypto.randomUUID(),
          babyId,
          milestoneId: template?.id || `custom-${Date.now()}`,
          name,
          description,
          category,
          expectedAgeMonthsMin: ageMonthsMin,
          expectedAgeMonthsMax: ageMonthsMax,
          actualDate: achievedDate || undefined,
          notes: notes.trim() || undefined,
          isCustom: isCustom ?? false,
        });
      }
      onSave?.();
      handleClose();
    } catch (err) {
      console.error("[AddMilestoneSheet] Save error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUnmark() {
    if (!existingRecord) return;

    setIsSaving(true);
    try {
      await updateMilestone(existingRecord.id, {
        actualDate: undefined,
      });
      onSave?.();
      handleClose();
    } catch (err) {
      console.error("[AddMilestoneSheet] Unmark error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!existingRecord) return;
    if (!confirm("Deseja remover este marco?")) return;

    try {
      await deleteMilestone(existingRecord.id);
      onSave?.();
      handleClose();
    } catch (err) {
      console.error("[AddMilestoneSheet] Delete error:", err);
    }
  }

  const categories = Object.entries(CATEGORY_INFO) as [MilestoneCategory, (typeof CATEGORY_INFO)[MilestoneCategory]][];

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Marco Alcançado" : "Adicionar Marco"}
      subtitle={isEditing ? "Marque a data em que seu bebê alcançou este marco" : "Registre um marco personalizado do seu bebê"}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Step: Edit or Select */}
        {formState === "edit" && !isEditing && (
          <>
            {/* Name */}
            <Input
              label="Nome do Marco"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Primeiro sorriso"
            />

            {/* Category */}
            <div className="flex flex-col gap-3">
              <label className="font-data text-xs text-text-secondary uppercase tracking-wider">
                Categoria
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`
                      p-4 rounded-2xl border-2 transition-all duration-200
                      ${
                        category === key
                          ? "border-primary bg-primary/10"
                          : "border-surface-variant/30 bg-surface-container hover:border-primary/30"
                      }
                    `}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 mx-auto"
                      style={{ backgroundColor: `${info.color}20` }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: info.color }}
                      >
                        {info.label.charAt(0)}
                      </span>
                    </div>
                    <span
                      className={`font-data text-xs font-medium ${
                        category === key ? "text-primary" : "text-text-secondary"
                      }`}
                    >
                      {info.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Age range */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Idade Mínima (meses)"
                type="number"
                min={0}
                max={36}
                value={ageMonthsMin}
                onChange={(e) => setAgeMonthsMin(Number(e.target.value))}
              />
              <Input
                label="Idade Máxima (meses)"
                type="number"
                min={0}
                max={36}
                value={ageMonthsMax}
                onChange={(e) => setAgeMonthsMax(Number(e.target.value))}
              />
            </div>

            {/* Description */}
            <Input
              label="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes sobre este marco..."
            />

            {/* Continue button */}
            <button
              onClick={() => setFormState("date")}
              disabled={!name.trim()}
              className="w-full h-14 bg-primary hover:bg-primary/90 active:scale-[0.98] text-on-primary font-display font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              Continuar
              <Check className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Step: Date */}
        {formState === "date" && (
          <>
            <DateInput
              label="Quando seu bebê alcançou isso?"
              name="achievedDate"
            />

            {/* Notes toggle */}
            {!showNotes ? (
              <button
                onClick={() => setShowNotes(true)}
                className="w-full flex items-center justify-between py-4 border-y border-outline-variant/10 group"
              >
                <span className="font-display text-base text-text-primary group-hover:text-primary transition-colors">
                  Adicionar notas
                </span>
                <div className="w-8 h-8 rounded-full bg-surface-variant/20 flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-all">
                  <Plus className="w-5 h-5" />
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                <label className="font-data text-xs text-text-secondary uppercase tracking-wider">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Foi no colo da vovó!"
                  rows={3}
                  className="w-full p-4 bg-surface-container rounded-2xl text-text-primary font-data text-sm placeholder:text-text-placeholder resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            <div className="flex gap-3">
              {isEditing && existingRecord.actualDate && (
                <button
                  onClick={handleUnmark}
                  disabled={isSaving}
                  className="h-14 px-4 bg-surface-variant/30 hover:bg-surface-variant/50 active:scale-[0.98] text-text-primary font-display font-medium rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Desmarcar
                </button>
              )}

              {!isEditing && (
                <button
                  onClick={() => setFormState(isCustom ? "edit" : "date")}
                  className="flex-1 h-14 bg-surface-variant/30 hover:bg-surface-variant/50 active:scale-[0.98] text-text-primary font-display font-medium rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  Voltar
                </button>
              )}

              {isEditing && (
                <button
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="w-14 h-14 bg-tertiary-container/20 hover:bg-tertiary-container/30 active:scale-[0.98] text-tertiary-container font-display font-medium rounded-2xl flex items-center justify-center transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 h-14 bg-primary hover:bg-primary/90 active:scale-[0.98] text-on-primary font-display font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </Sheet>
  );
}
