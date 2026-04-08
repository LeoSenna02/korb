"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Milk,
  Moon,
  Droplets,
  Ruler,
  Sparkles,
  CalendarHeart,
  TrendingUp,
} from "lucide-react";
import type { RecordCounts } from "@/lib/sync/repositories";
import { formatNumber } from "@/lib/utils/format";

interface BabySummarySectionProps {
  counts: RecordCounts;
  totalDays: number;
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

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <motion.div
      variants={item}
      className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10 group hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
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
    </motion.div>
  );
}

export function BabySummarySection({
  counts,
  totalDays,
}: BabySummarySectionProps) {
  const totalRecords =
    counts.totalFeedings +
    counts.totalSleeps +
    counts.totalDiapers +
    counts.totalGrowth +
    counts.totalMilestones +
    counts.totalVaccines;

  const avgFeedingsPerDay =
    totalDays > 0 ? (counts.totalFeedings / totalDays).toFixed(1) : "0";
  const avgDiapersPerDay =
    totalDays > 0 ? (counts.totalDiapers / totalDays).toFixed(1) : "0";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-8"
    >
      <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-4">
        Resumo
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={<Milk className="w-4 h-4" strokeWidth={1.5} />}
          label="Mamadas"
          value={formatNumber(counts.totalFeedings)}
          color="#8EAF96"
        />
        <StatCard
          icon={<Moon className="w-4 h-4" strokeWidth={1.5} />}
          label="Sessoes de sono"
          value={formatNumber(counts.totalSleeps)}
          color="#B48EAD"
        />
        <StatCard
          icon={<Droplets className="w-4 h-4" strokeWidth={1.5} />}
          label="Fraldas"
          value={formatNumber(counts.totalDiapers)}
          color="#D2B59D"
        />
        <StatCard
          icon={<Ruler className="w-4 h-4" strokeWidth={1.5} />}
          label="Crescimento"
          value={formatNumber(counts.totalGrowth)}
          color="#88AFC7"
        />
      </div>

      <Link
        href="/dashboard/growth"
        className="block mb-6"
      >
        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10 group hover:border-primary/20 transition-all duration-300 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#88AFC7]/15">
              <Ruler className="w-4 h-4 text-[#88AFC7]" strokeWidth={1.5} />
            </div>
            <div>
              <span className="font-display text-sm font-medium text-text-primary block">
                Ver detalhes de crescimento
              </span>
              <span className="font-data text-[10px] text-text-disabled">
                Graficos e historico completo
              </span>
            </div>
          </div>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-4 h-4 text-text-disabled transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </Link>

      <Link
        href="/milestones"
        className="block mb-6"
      >
        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10 group hover:border-primary/20 transition-all duration-300 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#D2B59D]/15">
              <Sparkles className="w-4 h-4 text-[#D2B59D]" strokeWidth={1.5} />
            </div>
            <div>
              <span className="font-display text-sm font-medium text-text-primary block">
                Marcos de desenvolvimento
              </span>
              <span className="font-data text-[10px] text-text-disabled">
                {formatNumber(counts.totalMilestones)} marcos registrados
              </span>
            </div>
          </div>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-4 h-4 text-text-disabled transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </Link>

      <motion.div
        variants={item}
        className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10 mb-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-text-secondary" strokeWidth={1.5} />
          <span className="font-display text-sm font-medium text-text-primary">
            Medias diarias
          </span>
        </div>
        <div className="flex flex-col divide-y divide-surface-variant/10">
          <div className="flex items-center justify-between py-2.5">
            <span className="font-data text-xs text-text-disabled uppercase tracking-wider">
              Mamadas/dia
            </span>
            <span className="font-data text-sm text-text-primary font-medium">
              {avgFeedingsPerDay}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="font-data text-xs text-text-disabled uppercase tracking-wider">
              Fraldas/dia
            </span>
            <span className="font-data text-sm text-text-primary font-medium">
              {avgDiapersPerDay}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="font-data text-xs text-text-disabled uppercase tracking-wider">
              Total de registros
            </span>
            <span className="font-data text-sm text-text-primary font-medium">
              {formatNumber(totalRecords)}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <CalendarHeart className="w-4 h-4 text-text-secondary" strokeWidth={1.5} />
          <span className="font-display text-sm font-medium text-text-primary">
            Linha do tempo
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-data text-xs text-text-disabled uppercase tracking-wider">
            Dias juntos
          </span>
          <span className="font-data text-sm text-text-primary font-medium">
            {formatNumber(totalDays)} dias
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
