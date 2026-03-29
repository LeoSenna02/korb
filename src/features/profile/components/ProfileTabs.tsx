"use client";

import type { ProfileSection } from "../types";

interface ProfileTabsProps {
  active: ProfileSection;
  onChange: (section: ProfileSection) => void;
}

const tabs: { id: ProfileSection; label: string }[] = [
  { id: "caregivers", label: "Cuidadores" },
  { id: "settings", label: "Config" },
  { id: "data", label: "Dados" },
];

export function ProfileTabs({ active, onChange }: ProfileTabsProps) {
  return (
    <div className="px-6 -mx-6 mb-6">
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-4 pt-1 px-1">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex-shrink-0 px-5 py-2.5 rounded-full font-display text-sm font-medium
                transition-all duration-300 whitespace-nowrap active:scale-95
                ${
                  isActive
                    ? "bg-primary text-on-primary glow-primary"
                    : "bg-surface-container-low border border-surface-variant/20 text-text-secondary hover:bg-surface-variant/40 hover:text-text-primary"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
