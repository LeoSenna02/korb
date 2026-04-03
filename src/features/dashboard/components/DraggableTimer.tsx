"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSleep } from "@/contexts/SleepContext";
import { useLowPerformanceMode } from "@/lib/hooks/useLowPerformanceMode";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function DraggableTimer() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const { isActive, isPaused, elapsedSeconds } = useSleep();
  const router = useRouter();
  const lowPerformanceMode = useLowPerformanceMode();

  if (!isActive) return null;

  const timerLabel = isPaused ? "Timer Pausado" : "Timer Ativo";
  const containerClasses = isPaused
    ? "bg-[#D2B59D]/18 border-[#D2B59D]/35 hover:bg-[#D2B59D]/24"
    : "bg-surface-container-highest/90 border-outline-variant/50 hover:bg-surface-variant";
  const dotClasses = isPaused
    ? "bg-[#D2B59D] shadow-[0_0_8px_rgba(210,181,157,0.7)]"
    : `bg-[#8EAF96] shadow-[0_0_8px_rgba(142,175,150,0.8)] ${lowPerformanceMode ? "" : "animate-pulse"}`;
  const textClasses = isPaused ? "text-[#E7D6C8]" : "text-text-primary";

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 px-4 flex justify-center items-end"
      style={{ paddingBottom: "calc(7.5rem + env(safe-area-inset-bottom))" }}
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
        <div className={`flex items-center gap-3 px-5 py-3 border shadow-elevated rounded-full cursor-grab active:cursor-grabbing transition-colors ${lowPerformanceMode ? "" : "backdrop-blur-xl"} ${containerClasses}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${dotClasses}`} />
          <span className={`font-data text-sm tracking-wide font-medium ${textClasses}`}>
            {timerLabel}: {formatElapsed(elapsedSeconds)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
