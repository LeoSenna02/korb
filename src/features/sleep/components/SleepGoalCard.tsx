"use client";

import { formatDuration } from "@/lib/utils/format";
import { useSleepGoal } from "../hooks/useSleepGoal";

function formatGoalValue(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${String(minutes).padStart(2, "0")}`;
}

export function SleepGoalCard() {
  const { goal, isLoading } = useSleepGoal();
  const totalSeconds = goal?.totalSecondsToday ?? 0;
  const progressPercent = goal?.progressPercent ?? 0;
  const goalLabel = goal
    ? `${formatGoalValue(goal.minSeconds)}–${formatGoalValue(goal.maxSeconds)}`
    : "--";

  return (
    <div className="mx-6 p-6 pb-5 bg-surface-container-low border border-outline-variant/10 rounded-[28px] relative z-10 mb-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="font-data text-[10px] text-text-secondary uppercase tracking-[0.2em] block mb-1">
            TOTAL DE HOJE
          </span>
          <div className="font-display text-2xl text-text-primary font-medium leading-none">
            {isLoading ? "..." : formatDuration(totalSeconds)}
          </div>
        </div>
        <div className="font-data text-xs text-text-disabled pb-0.5">
          Meta: <span className="text-primary font-medium tracking-wide">{goalLabel}</span>
        </div>
      </div>

      <div className="flex h-2.5 mb-3">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${progressPercent}%`, transition: "width 0.5s ease" }}
        />
        <div className="h-full bg-surface-variant rounded-r-full flex-1" />
      </div>

      <div className="flex justify-between px-1">
        <span className="font-data text-[9px] text-text-disabled uppercase tracking-widest">0H</span>
        <span className="font-data text-[9px] text-text-disabled uppercase tracking-widest">NOITE</span>
        <span className="font-data text-[9px] text-text-disabled uppercase tracking-widest">TARDE</span>
        <span className="font-data text-[9px] text-text-disabled uppercase tracking-widest">META</span>
      </div>
    </div>
  );
}
