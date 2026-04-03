"use client";

import { motion } from "framer-motion";
import { SleepTimerHeader } from "./SleepTimerHeader";
import { SleepStatusCircle } from "./SleepStatusCircle";
import { SleepActionButtons } from "./SleepActionButtons";
import { SleepGoalCard } from "./SleepGoalCard";
import { SleepBackgroundWrapper } from "./SleepBackgroundWrapper";

const pageTransition = {
  duration: 0.45,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

export function SleepPageContent() {
  return (
    <main className="min-h-screen bg-surface-dim flex flex-col relative overflow-hidden font-sans">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute w-[150%] aspect-square rounded-full border border-white/[0.02]" />
        <div className="absolute w-[120%] aspect-square rounded-full border border-white/[0.03]" />
        <div className="absolute w-[90%] aspect-square rounded-full border border-white/[0.04]" />
        <div className="absolute w-[60%] aspect-square rounded-full border border-white/[0.05]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,158,135,0.05)_0%,transparent_70%)]" />
      </div>

      <SleepBackgroundWrapper />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={pageTransition}
        className="relative z-10 flex min-h-screen flex-col"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...pageTransition, delay: 0.05 }}
        >
          <SleepTimerHeader />
        </motion.div>

        <div className="flex-1 flex flex-col justify-between">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...pageTransition, delay: 0.1 }}
            className="flex-1"
          >
            <SleepStatusCircle />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...pageTransition, delay: 0.16 }}
            className="mt-auto"
          >
            <SleepActionButtons />
            <SleepGoalCard />
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
