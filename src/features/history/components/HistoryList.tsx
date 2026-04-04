"use client";

import { Droplet, Baby, Moon, BarChart2, Stethoscope } from "lucide-react";
import type { HistoryFilter } from "../types";
import type { HistoryActivity } from "../types";

const FILTERS: { label: string; value: HistoryFilter }[] = [
  { label: "Tudo", value: "tudo" },
  { label: "Mamada", value: "mamada" },
  { label: "Fralda", value: "fralda" },
  { label: "Sono", value: "sono" },
  { label: "Crescimento", value: "crescimento" },
  { label: "Consulta", value: "consulta" },
];

const iconMap: Record<HistoryActivity["type"], React.ElementType> = {
  mamada: Baby,
  fralda: Droplet,
  sono: Moon,
  crescimento: BarChart2,
  consulta: Stethoscope,
};

const iconColorMap: Record<HistoryActivity["type"], string> = {
  mamada: "text-[#8EAF96]",
  fralda: "text-[#D2B59D]",
  sono: "text-[#B48EAD]",
  crescimento: "text-text-primary",
  consulta: "text-[#88AFC7]",
};

const iconBgMap: Record<HistoryActivity["type"], string> = {
  mamada: "bg-[#8EAF96]/10",
  fralda: "bg-[#D2B59D]/10",
  sono: "bg-[#B48EAD]/10",
  crescimento: "bg-surface-variant",
  consulta: "bg-[#88AFC7]/10",
};

interface HistoryFilterBarProps {
  active: HistoryFilter;
  onChange: (filter: HistoryFilter) => void;
}

export function HistoryFilterBar({ active, onChange }: HistoryFilterBarProps) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pt-2 pb-6 -mx-6 px-6 scrollbar-none">
      {FILTERS.map((f) => {
        const isActive = active === f.value;
        return (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={`
              flex-shrink-0 px-5 py-2.5 rounded-full font-display text-sm font-medium
              transition-all duration-300 transform active:scale-95 whitespace-nowrap
              ${
                isActive
                  ? "bg-primary text-on-primary glow-primary"
                  : "bg-surface-container-low border border-surface-variant/20 text-text-secondary hover:bg-surface-variant/40 hover:text-text-primary"
              }
            `}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

interface ActivityCardProps {
  activity: HistoryActivity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const Icon = iconMap[activity.type];

  return (
    <div className="flex items-center justify-between px-4 py-4 bg-surface-container-low rounded-2xl border border-white/5 relative overflow-hidden group transition-all duration-300 hover:border-surface-variant/40 hover:bg-surface-container btn-glow-ghost active:scale-[0.98]">
      {/* Accent bar left */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full opacity-60
          ${activity.type === "mamada" ? "bg-[#8EAF96]" : ""}
          ${activity.type === "fralda" ? "bg-[#D2B59D]" : ""}
          ${activity.type === "sono" ? "bg-[#B48EAD]" : ""}
          ${activity.type === "crescimento" ? "bg-text-disabled" : ""}
          ${activity.type === "consulta" ? "bg-[#88AFC7]" : ""}
        `}
      />

      <div className="flex items-center gap-4 ml-1">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBgMap[activity.type]} ${iconColorMap[activity.type]}`}
        >
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <span className="font-display text-[15px] font-semibold text-text-primary leading-tight">
            {activity.title}
          </span>
          <span className="font-data text-[11px] text-text-disabled uppercase tracking-wider mt-0.5">
            {activity.details}
          </span>
        </div>
      </div>

      {/* Time and duration */}
      <div className="flex flex-col items-end gap-1 ml-2">
        <span className="font-data text-[14px] font-semibold text-text-primary tabular-nums">
          {activity.time}
        </span>
        {activity.duration && (
          <span
            className={`font-data text-[10px] tracking-wide
              ${activity.isOngoing ? "text-[#B48EAD] font-semibold" : "text-text-disabled"}
            `}
          >
            {activity.isOngoing && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B48EAD] mr-1 animate-pulse align-middle" />
            )}
            {activity.duration}
          </span>
        )}
      </div>
    </div>
  );
}
