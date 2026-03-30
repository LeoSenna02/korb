"use client";

import { Check } from "lucide-react";
import type { MilestoneTemplate } from "../constants";
import type { MilestoneRecord } from "../types";
import { formatAgeRange } from "../constants";
import { formatDate } from "@/lib/utils/format";

interface MilestoneItemProps {
  template: MilestoneTemplate;
  record?: MilestoneRecord;
  onToggle: (template: MilestoneTemplate) => void;
}

export function MilestoneItem({ template, record, onToggle }: MilestoneItemProps) {
  const isAchieved = record?.actualDate !== undefined;
  const achievedDate = record?.actualDate ? formatDate(record.actualDate) : null;

  return (
    <button
      onClick={() => onToggle(template)}
      className="w-full flex items-center gap-4 py-4 px-2 rounded-2xl hover:bg-surface-variant/20 transition-all duration-200 active:scale-[0.98] group"
    >
      {/* Checkbox */}
      <div
        className={`
          w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
          transition-all duration-300 border-2
          ${
            isAchieved
              ? "bg-primary border-primary"
              : "border-outline-variant/40 group-hover:border-primary/50"
          }
        `}
      >
        {isAchieved && <Check className="w-4 h-4 text-on-primary" strokeWidth={3} />}
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        <div className="flex items-baseline gap-3">
          <span
            className={`
              font-display text-base font-medium transition-colors
              ${isAchieved ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"}
            `}
          >
            {template.name}
          </span>
          {isAchieved ? (
            <span className="font-data text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {achievedDate}
            </span>
          ) : null}
        </div>
        <p className="font-data text-xs text-text-tertiary mt-0.5">
          {formatAgeRange(template.expectedAgeMonthsMin, template.expectedAgeMonthsMax)}
        </p>
      </div>

      {/* Custom badge */}
      {record?.isCustom && (
        <span className="font-data text-[10px] text-text-tertiary uppercase tracking-wider">
          Custom
        </span>
      )}
    </button>
  );
}
