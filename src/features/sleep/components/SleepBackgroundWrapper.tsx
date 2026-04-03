"use client";

import { useLowPerformanceMode } from "@/lib/hooks/useLowPerformanceMode";
import { SleepBackgroundEffect } from "./SleepBackgroundEffect";
import { SleepBackgroundStaticEffect } from "./SleepBackgroundStaticEffect";

export function SleepBackgroundWrapper() {
  const lowPerformanceMode = useLowPerformanceMode();

  return lowPerformanceMode ? <SleepBackgroundStaticEffect /> : <SleepBackgroundEffect />;
}
