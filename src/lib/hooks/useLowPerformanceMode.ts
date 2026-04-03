"use client";

import { useState } from "react";

function detectLowPerformanceMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const userAgent = navigator.userAgent;
  const isIOS =
    /iPhone|iPad|iPod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isWebKit = /AppleWebKit/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);

  return prefersReducedMotion || (isIOS && isWebKit) || (isCoarsePointer && isWebKit);
}

export function useLowPerformanceMode(): boolean {
  const [lowPerformanceMode] = useState(detectLowPerformanceMode);
  return lowPerformanceMode;
}
