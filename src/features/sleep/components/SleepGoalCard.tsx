"use client";

import { useCallback, useEffect, useState } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { useSleep } from "@/contexts/SleepContext";
import { getTotalSleepSecondsToday } from "@/lib/sync/repositories/sleep";
import { subscribeToDataSync } from "@/lib/sync/events";

const GOAL_SECONDS = 14 * 3600;

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function SleepGoalCard() {
  const { baby } = useBaby();
  const { isActive } = useSleep();
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTotal = useCallback(async () => {
    if (!baby) return;
    setIsLoading(true);
    try {
      const total = await getTotalSleepSecondsToday(baby.id);
      setTotalSeconds(total);
    } finally {
      setIsLoading(false);
    }
  }, [baby]);

  useEffect(() => {
    void fetchTotal();
  }, [fetchTotal, isActive]);

  useEffect(
    () =>
      subscribeToDataSync(() => {
        void fetchTotal();
      }),
    [fetchTotal]
  );

  const progress = Math.min(totalSeconds / GOAL_SECONDS, 1);
  const progressPercent = Math.round(progress * 100);

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
          Meta: <span className="text-primary font-medium tracking-wide">14h</span>
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
