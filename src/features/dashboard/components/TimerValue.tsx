"use client";

interface TimerValueProps {
  value: string;
  className?: string;
}

export function TimerValue({ value, className = "" }: TimerValueProps) {
  return (
    <span
      className={`inline-flex h-[1em] items-center justify-center align-middle leading-none tabular-nums ${className}`.trim()}
    >
      {value}
    </span>
  );
}
