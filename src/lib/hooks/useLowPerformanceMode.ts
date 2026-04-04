"use client";

import { useState } from "react";

interface NavigatorWithPerformanceHints extends Navigator {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
  deviceMemory?: number;
}

function detectLowPerformanceMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const performanceNavigator = navigator as NavigatorWithPerformanceHints;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const saveData = performanceNavigator.connection?.saveData === true;
  const effectiveType = performanceNavigator.connection?.effectiveType;
  const isSlowConnection = effectiveType === "slow-2g" || effectiveType === "2g";
  const hardwareConcurrency = navigator.hardwareConcurrency ?? 8;
  const deviceMemory = performanceNavigator.deviceMemory ?? 4;
  const isLowEndHardware = hardwareConcurrency <= 4 || deviceMemory <= 2;

  return prefersReducedMotion || saveData || isSlowConnection || (isCoarsePointer && isLowEndHardware);
}

export function useLowPerformanceMode(): boolean {
  const [lowPerformanceMode] = useState(detectLowPerformanceMode);
  return lowPerformanceMode;
}
