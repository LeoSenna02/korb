"use client";

import { AnimatePresence, motion } from "framer-motion";

interface AnimatedTimeValueProps {
  value: string;
  className?: string;
  animated?: boolean;
}

function RollingDigit({ digit }: { digit: string }) {
  return (
    <span className="relative inline-flex h-[1em] items-center justify-center overflow-hidden align-middle leading-none">
      <span className="invisible leading-none">{digit}</span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 flex items-center justify-center leading-none"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function AnimatedTimeValue({
  value,
  className = "",
  animated = false,
}: AnimatedTimeValueProps) {
  const classes = `inline-flex h-[1em] items-center justify-center align-middle leading-none tabular-nums ${className}`.trim();

  if (!animated) {
    return <span className={classes}>{value}</span>;
  }

  const parts = value.split(":");

  return (
    <span className={classes}>
      {parts.map((part, partIndex) => (
        <span key={`${partIndex}-${part}`} className="inline-flex items-center leading-none">
          {part.split("").map((digit, digitIndex) => (
            <RollingDigit key={`${partIndex}-${digitIndex}`} digit={digit} />
          ))}
          {partIndex < parts.length - 1 && (
            <span className="inline-flex h-[1em] items-center leading-none opacity-70">:</span>
          )}
        </span>
      ))}
    </span>
  );
}
