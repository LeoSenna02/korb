"use client";

import { motion } from "framer-motion";
import { Weight, Ruler, CircleDot, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils/format";
import type { GrowthSummary } from "../types";

interface GrowthSummaryCardsProps {
  summary: GrowthSummary;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  gain?: string | null;
  color: string;
}

function SummaryCard({ icon, label, value, gain, color }: SummaryCardProps) {
  return (
    <motion.div
      variants={item}
      className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10 group hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <span className="font-data text-[10px] uppercase tracking-wider text-text-disabled">
          {label}
        </span>
      </div>
      <span className="font-display text-2xl font-semibold text-text-primary tracking-tight block">
        {value}
      </span>
      {gain && (
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp className="w-3 h-3 text-[#8EAF96]" strokeWidth={1.5} />
          <span className="font-data text-[10px] text-[#8EAF96] uppercase tracking-wider">
            +{gain}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export function GrowthSummaryCards({ summary }: GrowthSummaryCardsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-3 mb-6"
    >
      <SummaryCard
        icon={<Weight className="w-3.5 h-3.5" strokeWidth={1.5} />}
        label="Peso"
        value={summary.currentWeightKg != null ? `${formatNumber(summary.currentWeightKg)} kg` : "--"}
        gain={summary.weightGainKg != null ? `${formatNumber(summary.weightGainKg)} kg` : null}
        color="#8EAF96"
      />
      <SummaryCard
        icon={<Ruler className="w-3.5 h-3.5" strokeWidth={1.5} />}
        label="Altura"
        value={summary.currentHeightCm != null ? `${formatNumber(summary.currentHeightCm)} cm` : "--"}
        gain={summary.heightGainCm != null ? `${formatNumber(summary.heightGainCm)} cm` : null}
        color="#B48EAD"
      />
      <SummaryCard
        icon={<CircleDot className="w-3.5 h-3.5" strokeWidth={1.5} />}
        label="Cefalico"
        value={summary.currentCephalicCm != null ? `${formatNumber(summary.currentCephalicCm)} cm` : "--"}
        gain={summary.cephalicGainCm != null ? `${formatNumber(summary.cephalicGainCm)} cm` : null}
        color="#D2B59D"
      />
    </motion.div>
  );
}
