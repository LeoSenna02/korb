import { Baby, Moon, Droplet } from "lucide-react";
import type { WeeklyStat } from "../types";

const statIconMap: Record<WeeklyStat["icon"], React.ElementType> = {
  feeding: Baby,
  sleep: Moon,
  diaper: Droplet,
  growth: () => null,
};

const statIconColorMap: Record<WeeklyStat["icon"], string> = {
  feeding: "text-[#8EAF96]",
  sleep: "text-[#B48EAD]",
  diaper: "text-[#D2B59D]",
  growth: "text-text-secondary",
};

const statIconBgMap: Record<WeeklyStat["icon"], string> = {
  feeding: "bg-[#8EAF96]/10",
  sleep: "bg-[#B48EAD]/10",
  diaper: "bg-[#D2B59D]/10",
  growth: "bg-surface-variant",
};

interface WeeklyStatsGridProps {
  stats: WeeklyStat[];
}

export function WeeklyStatsGrid({ stats }: WeeklyStatsGridProps) {
  return (
    <div className="mb-8">
      <h2 className="font-data text-[10px] uppercase tracking-[0.2em] text-text-disabled mb-3">
        Esta Semana
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = statIconMap[stat.icon];
          const isDiaper = stat.id === "diapers";

          return (
            <div
              key={stat.id}
              className={`p-4 bg-surface-container-low rounded-2xl border border-surface-variant/20 flex flex-col gap-2 ${
                isDiaper ? "col-span-2" : ""
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${statIconBgMap[stat.icon]} ${statIconColorMap[stat.icon]}`}
              >
                <Icon className="w-4.5 h-4.5" strokeWidth={2} />
              </div>
              <span className="font-display text-2xl font-semibold text-text-primary tracking-tight">
                {stat.value}
              </span>
              <span className="font-data text-[10px] uppercase tracking-wider text-text-disabled leading-none">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
