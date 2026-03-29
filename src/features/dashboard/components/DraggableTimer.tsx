"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSleep } from "@/contexts/SleepContext";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function DraggableTimer() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const { isActive, elapsedSeconds } = useSleep();
  const router = useRouter();

  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 pb-28 px-4 flex justify-center items-end"
      ref={constraintsRef}
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        className="pointer-events-auto"
        onClick={() => router.push("/sleep")}
      >
        <div className="flex items-center gap-3 px-5 py-3 bg-surface-container-highest/90 backdrop-blur-xl border border-outline-variant/50 shadow-elevated rounded-full cursor-grab active:cursor-grabbing hover:bg-surface-variant transition-colors">
          <div className="w-2.5 h-2.5 rounded-full bg-[#8EAF96] shadow-[0_0_8px_rgba(142,175,150,0.8)] animate-pulse" />
          <span className="font-data text-sm text-text-primary tracking-wide font-medium">
            Timer Ativo: {formatElapsed(elapsedSeconds)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}