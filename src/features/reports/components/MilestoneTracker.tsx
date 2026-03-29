"use client";

import { Baby, Droplet, Moon, Ruler } from "lucide-react";
import type { Milestone, ActivityType } from "../types";

interface MilestoneTrackerProps {
  milestones: Milestone[];
}

const iconMap: Record<ActivityType, React.ElementType> = {
  mamada: Baby,
  fralda: Droplet,
  sono: Moon,
  crescimento: Ruler,
};

const iconColorMap: Record<ActivityType, string> = {
  mamada: "#8EAF96",
  fralda: "#D2B59D",
  sono: "#B48EAD",
  crescimento: "#E3E2E6",
};

const iconBgMap: Record<ActivityType, string> = {
  mamada: "bg-[#8EAF96]/10",
  fralda: "bg-[#D2B59D]/10",
  sono: "bg-[#B48EAD]/10",
  crescimento: "bg-surface-variant",
};

const badgeColorMap: Record<Milestone["badge"], string> = {
  gold: "#7B9E87",
  silver: "#A0A0A8",
  bronze: "#B8956E",
};

const badgeBgMap: Record<Milestone["badge"], string> = {
  gold: "bg-[#7B9E87]/10",
  silver: "bg-[#A0A0A8]/10",
  bronze: "bg-[#B8956E]/10",
};

export function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  return (
    <div className="mb-8">
      <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-3">
        Marcos Alcançados
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {milestones.map((milestone) => {
          const Icon = iconMap[milestone.type];
          const iconColor = iconColorMap[milestone.type];
          const badgeColor = badgeColorMap[milestone.badge];

          return (
            <div
              key={milestone.id}
              className="p-4 bg-surface-container-low rounded-2xl border border-surface-variant/20 flex flex-col gap-3 transition-all duration-200 hover:border-surface-variant/40"
            >
              {/* Top: icon + badge */}
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgMap[milestone.type]}`}
                  style={{ color: iconColor }}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>

                {/* Badge */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${badgeBgMap[milestone.badge]}`}
                  style={{ border: `1.5px solid ${badgeColor}40` }}
                  title={milestone.badge}
                >
                  <span
                    className="font-data text-[9px] font-bold uppercase"
                    style={{ color: badgeColor }}
                  >
                    {milestone.badge[0].toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div>
                <span className="font-display text-sm font-semibold text-text-primary leading-tight block mb-0.5">
                  {milestone.title}
                </span>
                <span className="font-data text-[10px] text-text-disabled block">
                  {milestone.description}
                </span>
              </div>

              {/* Date */}
              <div className="mt-auto">
                <span className="font-data text-[9px] text-text-disabled/60 uppercase tracking-wider">
                  {milestone.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
