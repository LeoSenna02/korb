"use client";

import { AnimatedTimeValue } from "@/components/ui";

interface TimerValueProps {
  value: string;
  className?: string;
  animated?: boolean;
}

export function TimerValue({ value, className = "", animated = false }: TimerValueProps) {
  return <AnimatedTimeValue value={value} className={className} animated={animated} />;
}
