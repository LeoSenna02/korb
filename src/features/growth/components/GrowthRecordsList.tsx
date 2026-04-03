"use client";

import { motion } from "framer-motion";
import { Weight, Ruler, CircleDot, FileText, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { formatWeightKgValue } from "@/features/dashboard/utils/growth";
import type { GrowthRecordDisplay } from "../types";

interface GrowthRecordsListProps {
  records: GrowthRecordDisplay[];
  deletingId?: string | null;
  onDelete?: (id: string) => void;
  onEdit?: (record: GrowthRecordDisplay) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

interface MetricBadgeProps {
  icon: React.ReactNode;
  value: string;
  unit: string;
  color: string;
}

function MetricBadge({ icon, value, unit, color }: MetricBadgeProps) {
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
      style={{ backgroundColor: `${color}15` }}
    >
      <span style={{ color }}>{icon}</span>
      <span className="font-data text-[11px] text-text-primary tabular-nums">
        {value}
      </span>
      <span className="font-data text-[9px] text-text-disabled">{unit}</span>
    </div>
  );
}

export function GrowthRecordsList({
  records,
  deletingId,
  onDelete,
  onEdit,
}: GrowthRecordsListProps) {
  if (records.length === 0) return null;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-6"
    >
      <h3 className="font-display text-base font-medium text-text-primary tracking-tight mb-4">
        Historico de medicoes
      </h3>

      <div className="flex flex-col gap-3">
        {records.map((record) => {
          const dateFormatted = formatDate(record.date);

          return (
            <motion.div
              key={record.id}
              variants={item}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10 group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-display text-sm font-medium text-text-primary block">
                  {dateFormatted}
                </span>

                <div className="flex items-center gap-1">
                  {onEdit ? (
                    <button
                      type="button"
                      aria-label="Editar medicao"
                      onClick={() => onEdit(record)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-text-disabled hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                  ) : null}

                  {onDelete ? (
                    <button
                      type="button"
                      aria-label="Excluir medicao"
                      disabled={deletingId === record.id}
                      onClick={() => onDelete(record.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-text-disabled hover:text-[#CD8282] hover:bg-[#CD8282]/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {record.weightKg != null && (
                  <MetricBadge
                    icon={<Weight className="w-3 h-3" strokeWidth={1.5} />}
                    value={formatWeightKgValue(record.weightKg)}
                    unit="kg"
                    color="#8EAF96"
                  />
                )}
                {record.heightCm != null && (
                  <MetricBadge
                    icon={<Ruler className="w-3 h-3" strokeWidth={1.5} />}
                    value={record.heightCm.toFixed(1)}
                    unit="cm"
                    color="#B48EAD"
                  />
                )}
                {record.cephalicCm != null && (
                  <MetricBadge
                    icon={<CircleDot className="w-3 h-3" strokeWidth={1.5} />}
                    value={record.cephalicCm.toFixed(1)}
                    unit="cm"
                    color="#D2B59D"
                  />
                )}
              </div>

              {record.notes && (
                <div className="mt-3 pt-3 border-t border-surface-variant/10 flex items-start gap-2">
                  <FileText className="w-3 h-3 text-text-disabled flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="font-data text-[11px] text-text-secondary leading-relaxed">
                    {record.notes}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
