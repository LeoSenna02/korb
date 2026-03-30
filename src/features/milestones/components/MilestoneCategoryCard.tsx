"use client";

import { motion } from "framer-motion";
import { MilestoneItem } from "./MilestoneItem";
import type { MilestoneCategory } from "../constants";
import { CATEGORY_INFO, type MilestoneTemplate } from "../constants";
import type { MilestoneRecord } from "../types";

interface MilestoneCategoryCardProps {
  category: MilestoneCategory;
  templates: MilestoneTemplate[];
  records: MilestoneRecord[];
  onToggleMilestone: (template: MilestoneTemplate) => void;
}

export function MilestoneCategoryCard({
  category,
  templates,
  records,
  onToggleMilestone,
}: MilestoneCategoryCardProps) {
  const info = CATEGORY_INFO[category];
  const achievedCount = records.filter((r) => r.actualDate !== undefined).length;
  const totalCount = templates.length;
  const progressPercentage = totalCount > 0 ? (achievedCount / totalCount) * 100 : 0;

  // Map records by milestoneId for quick lookup
  const recordMap = new Map(records.map((r) => [r.milestoneId, r]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container rounded-3xl p-6 backdrop-blur-xl overflow-hidden"
      style={{
        boxShadow: `0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        {/* Category icon */}
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${info.color}20` }}
        >
          <CategoryIcon name={info.icon} color={info.color} />
        </div>

        <div className="flex-1">
          <h3
            className="font-display text-lg font-semibold"
            style={{ color: info.color }}
          >
            {info.label}
          </h3>
          <p className="font-data text-xs text-text-tertiary">
            {achievedCount} de {totalCount} alcançados
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex flex-col items-end gap-1">
          <span
            className="font-data text-sm font-semibold"
            style={{ color: info.color }}
          >
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface-variant/30 rounded-full overflow-hidden mb-5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full"
          style={{ backgroundColor: info.color }}
        />
      </div>

      {/* Milestones list */}
      <div className="space-y-1">
        {templates.map((template) => (
          <MilestoneItem
            key={template.id}
            template={template}
            record={recordMap.get(template.id)}
            onToggle={onToggleMilestone}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Simple icon component using SVG paths
function CategoryIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, React.ReactNode> = {
    body: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="w-5 h-5">
        <circle cx="12" cy="5" r="3" />
        <path d="M12 8v8M8 12h8M8 20l4-4 4 4" />
      </svg>
    ),
    hand: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="w-5 h-5">
        <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
    ),
    "message-circle": (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="w-5 h-5">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  };

  return icons[name] || null;
}
