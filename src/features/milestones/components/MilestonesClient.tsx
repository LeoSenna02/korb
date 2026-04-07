"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { MilestoneCategoryCard } from "./MilestoneCategoryCard";
import { AddMilestoneSheet } from "./AddMilestoneSheet";
import { useMilestones } from "../hooks/useMilestones";
import { DEFAULT_MILESTONES, getMilestonesByCategory, type MilestoneCategory, type MilestoneTemplate } from "../constants";
import type { MilestoneRecord } from "../types";
import { useBaby } from "@/contexts/BabyContext";
import { saveMilestone, updateMilestone } from "@/lib/sync/repositories/milestone";

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CATEGORIES: MilestoneCategory[] = ["motor_grossa", "motor_fina", "linguagem", "social"];

export function MilestonesClient() {
  const { baby } = useBaby();
  const { records, isLoading, refresh } = useMilestones();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MilestoneTemplate | undefined>();
  const [selectedRecord, setSelectedRecord] = useState<MilestoneRecord | undefined>();

  // Group records by category
  const recordsByCategory = useMemo(() => {
    const map = new Map<MilestoneCategory, MilestoneRecord[]>();
    for (const cat of CATEGORIES) {
      map.set(cat, []);
    }
    for (const record of records) {
      const existing = map.get(record.category);
      if (existing) {
        existing.push(record);
      }
    }
    return map;
  }, [records]);

  // Calculate overall progress
  const totalAchieved = records.filter((r) => r.actualDate !== undefined).length;
  const totalTemplates = DEFAULT_MILESTONES.length;
  const overallProgress = totalTemplates > 0 ? Math.round((totalAchieved / totalTemplates) * 100) : 0;

  async function handleToggleMilestone(template: MilestoneTemplate) {
    if (!baby) return;

    // Find existing record for this milestone (check both custom and non-custom)
    const existingRecord = records.find((r) => r.milestoneId === template.id);

    if (existingRecord) {
      if (existingRecord.actualDate) {
        await updateMilestone(existingRecord.id, {
          actualDate: undefined,
        });
        refresh();
      } else {
        // Has record but not achieved yet - mark as achieved with today
        await updateMilestone(existingRecord.id, {
          actualDate: getLocalDateString(),
        });
        refresh();
      }
    } else {
      // No record - create and mark as achieved with today
      const today = getLocalDateString();
      await saveMilestone({
        id: crypto.randomUUID(),
        babyId: baby.id,
        milestoneId: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        expectedAgeMonthsMin: template.expectedAgeMonthsMin,
        expectedAgeMonthsMax: template.expectedAgeMonthsMax,
        actualDate: today,
        isCustom: false,
      });
      refresh();
    }
  }

  function handleAddCustom() {
    setSelectedTemplate(undefined);
    setSelectedRecord(undefined);
    setSheetOpen(true);
  }

  function handleCloseSheet() {
    setSheetOpen(false);
    setSelectedTemplate(undefined);
    setSelectedRecord(undefined);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="font-data text-sm text-text-secondary">Carregando marcos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      {/* Overall progress header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container rounded-3xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Progresso Geral
            </h2>
            <p className="font-data text-xs text-text-tertiary mt-1">
              {totalAchieved} de {totalTemplates} marcos alcançados
            </p>
          </div>
          <div className="text-right">
            <span className="font-display text-3xl font-bold text-primary">
              {overallProgress}%
            </span>
          </div>
        </div>
        <div className="h-2 bg-surface-variant/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </motion.div>

      {/* Categories grid */}
      <div className="grid gap-6">
        {CATEGORIES.map((category, index) => {
          const templates = getMilestonesByCategory(category);
          const categoryRecords = recordsByCategory.get(category) || [];

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <MilestoneCategoryCard
                category={category}
                templates={templates}
                records={categoryRecords}
                onToggleMilestone={handleToggleMilestone}
              />
            </motion.div>
          );
        })}
      </div>

      {/* FAB for custom milestone */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        onClick={handleAddCustom}
        className="fixed bottom-8 right-6 w-14 h-14 bg-primary hover:bg-primary/90 active:scale-95 rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition-all z-40"
        style={{
          boxShadow: "0 4px 24px rgba(123, 158, 135, 0.3)",
        }}
      >
        <Plus className="w-6 h-6 text-on-primary" strokeWidth={2.5} />
      </motion.button>

      {/* Bottom sheet */}
      {baby && (
        <AddMilestoneSheet
          isOpen={sheetOpen}
          onClose={handleCloseSheet}
          babyId={baby.id}
          template={selectedTemplate}
          existingRecord={selectedRecord}
          onSave={refresh}
        />
      )}
    </div>
  );
}
