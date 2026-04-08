"use client";

import { useCallback, useEffect, useState } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { useSleep } from "@/contexts/SleepContext";
import { loadViewCache, readViewCache } from "@/lib/cache/view-cache";
import { subscribeToDataSync } from "@/lib/sync/events";
import { getReportSleeps } from "@/lib/sync/repositories";
import { getAgeInCompletedMonths, getLocalDateKey } from "@/lib/utils/format";
import type { SleepRecord } from "@/lib/db/types";
import type { SleepGoalRange } from "../types";

const HALF_HOUR_SECONDS = 30 * 60;
const HISTORY_DAYS = 7;
const CROSS_DAY_BUFFER_DAYS = 1;

interface AgeGoalBracket {
  maxMonths: number;
  minSeconds: number;
  maxSeconds: number;
}

interface UseSleepGoalReturn {
  goal: SleepGoalRange | null;
  isLoading: boolean;
}

const AGE_GOAL_BRACKETS: AgeGoalBracket[] = [
  { maxMonths: 3, minSeconds: 14 * 3600, maxSeconds: 17 * 3600 },
  { maxMonths: 12, minSeconds: 12 * 3600, maxSeconds: 16 * 3600 },
  { maxMonths: 24, minSeconds: 11 * 3600, maxSeconds: 14 * 3600 },
  { maxMonths: 60, minSeconds: 10 * 3600, maxSeconds: 13 * 3600 },
] satisfies AgeGoalBracket[];

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getLocalDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundToNearestHalfHour(seconds: number): number {
  return Math.round(seconds / HALF_HOUR_SECONDS) * HALF_HOUR_SECONDS;
}

function getAgeGoalRange(birthDate: string, referenceDate: Date): SleepGoalRange {
  const months = getAgeInCompletedMonths(birthDate, referenceDate.toISOString()) ?? 0;
  const bracket =
    AGE_GOAL_BRACKETS.find((candidate) => months <= candidate.maxMonths) ??
    AGE_GOAL_BRACKETS[AGE_GOAL_BRACKETS.length - 1];

  return {
    minSeconds: bracket.minSeconds,
    maxSeconds: bracket.maxSeconds,
    progressPercent: 0,
    source: "age",
    totalSecondsToday: 0,
  };
}

function sliceSleepByLocalDay(records: SleepRecord[]): Map<string, number> {
  const totalsByDay = new Map<string, number>();

  for (const record of records) {
    if (!record.endedAt) {
      continue;
    }

    const start = new Date(record.startedAt);
    const end = new Date(record.endedAt);

    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      end <= start
    ) {
      continue;
    }

    let cursor = start;

    while (cursor < end) {
      const dayStart = startOfLocalDay(cursor);
      const nextDayStart = addDays(dayStart, 1);
      const segmentEnd = end < nextDayStart ? end : nextDayStart;
      const seconds = Math.floor((segmentEnd.getTime() - cursor.getTime()) / 1000);

      if (seconds > 0) {
        const dayKey = getLocalDayKey(cursor);
        totalsByDay.set(dayKey, (totalsByDay.get(dayKey) ?? 0) + seconds);
      }

      cursor = segmentEnd;
    }
  }

  return totalsByDay;
}

function buildAdaptiveGoal(
  baseGoal: SleepGoalRange,
  totalsByDay: Map<string, number>,
  today: Date
): SleepGoalRange {
  const previousDayKeys = Array.from({ length: HISTORY_DAYS }, (_, index) =>
    getLocalDayKey(addDays(today, -(index + 1)))
  );

  const hasCompleteHistory = previousDayKeys.every((dayKey) => totalsByDay.has(dayKey));
  if (!hasCompleteHistory) {
    return baseGoal;
  }

  const recentAverageSeconds =
    previousDayKeys.reduce((sum, dayKey) => sum + (totalsByDay.get(dayKey) ?? 0), 0) /
    HISTORY_DAYS;

  const baseCenter = (baseGoal.minSeconds + baseGoal.maxSeconds) / 2;
  const baseHalfWidth = (baseGoal.maxSeconds - baseGoal.minSeconds) / 2;
  const adaptiveCenter = baseCenter * 0.7 + recentAverageSeconds * 0.3;

  const clampedMin = Math.max(baseGoal.minSeconds, adaptiveCenter - baseHalfWidth);
  const clampedMax = Math.min(baseGoal.maxSeconds, adaptiveCenter + baseHalfWidth);

  const roundedMin = clamp(
    roundToNearestHalfHour(clampedMin),
    baseGoal.minSeconds,
    baseGoal.maxSeconds
  );
  const roundedMax = clamp(
    roundToNearestHalfHour(clampedMax),
    baseGoal.minSeconds,
    baseGoal.maxSeconds
  );

  if (roundedMin >= roundedMax) {
    return baseGoal;
  }

  return {
    ...baseGoal,
    minSeconds: roundedMin,
    maxSeconds: roundedMax,
    source: "adaptive",
  };
}

async function resolveSleepGoal(babyId: string, birthDate: string): Promise<SleepGoalRange> {
  const today = startOfLocalDay(new Date());
  const todayKey = getLocalDayKey(today);
  const fetchStart = startOfLocalDay(addDays(today, -(HISTORY_DAYS + CROSS_DAY_BUFFER_DAYS)));
  const fetchEnd = endOfLocalDay(today);

  const sleeps = await getReportSleeps(babyId, fetchStart, fetchEnd);
  const totalsByDay = sliceSleepByLocalDay(sleeps);

  const baseGoal = getAgeGoalRange(birthDate, today);
  const goal = buildAdaptiveGoal(baseGoal, totalsByDay, today);
  const totalSecondsToday = totalsByDay.get(todayKey) ?? 0;
  const progressPercent = Math.min(
    Math.round((totalSecondsToday / goal.maxSeconds) * 100),
    100
  );

  return {
    ...goal,
    totalSecondsToday,
    progressPercent,
  };
}

export function useSleepGoal(): UseSleepGoalReturn {
  const { baby } = useBaby();
  const { isActive } = useSleep();
  const [goal, setGoal] = useState<SleepGoalRange | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoal = useCallback(async () => {
    if (!baby) {
      setGoal(null);
      setIsLoading(false);
      return;
    }

    const todayKey = getLocalDateKey(new Date().toISOString());
    const cacheKey = `sleep-goal:${baby.id}:${todayKey}`;
    const cached = readViewCache<SleepGoalRange>(cacheKey);

    if (cached) {
      setGoal(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    try {
      const nextGoal = await loadViewCache(cacheKey, () =>
        resolveSleepGoal(baby.id, baby.birthDate)
      );
      setGoal(nextGoal);
    } finally {
      setIsLoading(false);
    }
  }, [baby]);

  useEffect(() => {
    void fetchGoal();
  }, [fetchGoal, isActive]);

  useEffect(
    () =>
      subscribeToDataSync(() => {
        void fetchGoal();
      }),
    [fetchGoal]
  );

  return { goal, isLoading };
}
