"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Upload, Cloud } from "lucide-react";
import { ConfirmModal } from "@/components/ui";
import { useDataManagement } from "../hooks/useDataManagement";
import { useCloudMigration } from "../hooks/useCloudMigration";
import { useAppSettings } from "../hooks/useAppSettings";
import { CloudMigrationSheet } from "./CloudMigrationSheet";
import { useBaby } from "@/contexts/BabyContext";
import type { DataStats } from "../types";

interface DataManagementSectionProps {
  stats: DataStats;
  onImported?: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  badge?: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

function ActionCard({
  icon,
  title,
  subtitle,
  color,
  badge,
  onClick,
  disabled = false,
  isLoading = false,
}: ActionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      variants={item}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left group transition-all duration-300 hover:border-surface-variant/40 border border-white/5 bg-surface-container-low rounded-2xl p-4 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-display text-sm font-semibold text-text-primary">
              {title}
            </span>
            {badge && (
              <span className="font-data text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-[#8EAF96]/10 text-[#8EAF96]">
                {badge}
              </span>
            )}
          </div>
          <span className="font-data text-[11px] text-text-disabled block">
            {subtitle}
          </span>
        </div>
        {isLoading ? (
          <span className="w-4 h-4 mt-1 border-2 border-text-disabled border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-4 h-4 text-text-disabled mt-1 transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </motion.button>
  );
}

export function DataManagementSection({
  stats,
  onImported,
}: DataManagementSectionProps) {
  const {
    fileInputRef,
    feedback,
    isExporting,
    isPreparingImport,
    isImporting,
    importPreview,
    isConfirmOpen,
    exportData,
    openImportPicker,
    handleFileChange,
    cancelImport,
    confirmImport,
  } = useDataManagement({ onImported });

  const { baby } = useBaby();
  const { settings } = useAppSettings();
  const { progress, migrate, reset } = useCloudMigration(baby, settings);
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);

  const totalRecords =
    stats.totalFeedings +
    stats.totalSleeps +
    stats.totalDiapers +
    stats.totalGrowth +
    stats.totalVaccines +
    stats.totalAppointments;
  const isImportBusy = isPreparingImport || isImporting;

  return (
    <>
      <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-8"
    >
      <h3 className="font-display text-lg font-medium text-text-primary tracking-tight mb-4">
        Dados
      </h3>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-3">
        <ActionCard
          icon={<Download className="w-5 h-5" strokeWidth={1.5} />}
          title="Exportar Dados"
          subtitle={`${totalRecords} registros em ${stats.totalDays} dias`}
          color="#8EAF96"
          badge="JSON"
          onClick={exportData}
          disabled={isExporting || isImportBusy}
          isLoading={isExporting}
        />

        <ActionCard
          icon={<Upload className="w-5 h-5" strokeWidth={1.5} />}
          title="Importar Dados"
          subtitle="Restaurar de um arquivo JSON"
          color="#B48EAD"
          badge="JSON"
          onClick={openImportPicker}
          disabled={isExporting || isImportBusy}
          isLoading={isImportBusy}
        />

        <ActionCard
          icon={<Cloud className="w-5 h-5" strokeWidth={1.5} />}
          title="Backup na Nuvem"
          subtitle="Enviar dados para o Supabase"
          color="#D2B59D"
          badge="Sync"
          onClick={() => setIsMigrationOpen(true)}
          disabled={isExporting || isImportBusy}
        />
      </div>

      {feedback && (
        <motion.div
          variants={item}
          className={`mt-4 rounded-2xl border px-4 py-3 ${
            feedback.type === "success"
              ? "border-[#8EAF96]/30 bg-[#8EAF96]/10 text-[#8EAF96]"
              : "border-[#CD8282]/30 bg-[#CD8282]/10 text-[#CD8282]"
          }`}
        >
          <p className="font-data text-[11px] leading-relaxed">
            {feedback.message}
          </p>
        </motion.div>
      )}

      {/* Danger zone */}
      <motion.div variants={item} className="mt-6 pt-6 border-t border-surface-variant/10">
        <h4 className="font-data text-[10px] uppercase tracking-wider text-text-disabled mb-3">
          Zona de Perigo
        </h4>
        <motion.button
          variants={item}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full text-left group transition-all duration-200 border border-[#CD8282]/20 bg-[#CD8282]/5 rounded-2xl p-4 hover:border-[#CD8282]/40"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#CD8282]/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-[#CD8282]"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-display text-sm font-semibold text-[#CD8282] block mb-0.5">
                Apagar Todos os Dados
              </span>
              <span className="font-data text-[11px] text-[#CD8282]/60 block">
                Esta ação é irreversível
              </span>
            </div>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="w-4 h-4 text-[#CD8282]/40 mt-1 transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </motion.button>
      </motion.div>
      </motion.div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={cancelImport}
        onConfirm={confirmImport}
        title="Substituir dados atuais?"
        description={
          importPreview
            ? `O arquivo ${importPreview.fileName} contem ${importPreview.totalRecords} registros de ${importPreview.babyName}. Os dados atuais do bebe serao substituidos por este backup.`
            : "Os dados atuais do bebe serao substituidos por este backup."
        }
        confirmLabel="Importar backup"
        cancelLabel="Cancelar"
        variant="primary"
        isLoading={isImporting}
      />

      <CloudMigrationSheet
        isOpen={isMigrationOpen}
        onClose={() => setIsMigrationOpen(false)}
        progress={progress}
        onMigrate={migrate}
        onReset={reset}
      />
    </>
  );
}
