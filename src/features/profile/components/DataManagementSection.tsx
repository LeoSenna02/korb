"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Download, Trash2, Upload, Cloud } from "lucide-react";
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
          <ChevronRight className="w-4 h-4 text-text-disabled mt-1 transition-transform duration-200 group-hover:translate-x-0.5" />
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
    canDeleteAllData,
    isCheckingDeleteAccess,
    isExporting,
    isPreparingImport,
    isImporting,
    isDeletingAllData,
    importPreview,
    isConfirmOpen,
    isDeleteConfirmOpen,
    deleteConfirmationValue,
    exportData,
    openImportPicker,
    handleFileChange,
    cancelImport,
    confirmImport,
    openDeleteConfirm,
    closeDeleteConfirm,
    setDeleteConfirmationValue,
    confirmDeleteAllData,
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

      {!isCheckingDeleteAccess && canDeleteAllData && (
      <motion.div variants={item} className="mt-6 pt-6 border-t border-surface-variant/10">
        <h4 className="font-data text-[10px] uppercase tracking-wider text-text-disabled mb-3">
          Zona de Perigo
        </h4>
        <motion.button
          variants={item}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={openDeleteConfirm}
          disabled={isDeletingAllData}
          className="w-full text-left group transition-all duration-200 border border-[#CD8282]/20 bg-[#CD8282]/5 rounded-2xl p-4 hover:border-[#CD8282]/40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#CD8282]/10">
              <Trash2 className="w-5 h-5 text-[#CD8282]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-display text-sm font-semibold text-[#CD8282] block mb-0.5">
                Apagar Todos os Dados
              </span>
              <span className="font-data text-[11px] text-[#CD8282]/60 block">
                Esta ação é irreversível
              </span>
            </div>
            {isDeletingAllData ? (
              <span className="w-4 h-4 mt-1 border-2 border-[#CD8282]/40 border-t-[#CD8282] rounded-full animate-spin" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#CD8282]/40 mt-1 transition-transform duration-200 group-hover:translate-x-0.5" />
            )}
          </div>
        </motion.button>
      </motion.div>
      )}
      </motion.div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={cancelImport}
        onConfirm={confirmImport}
        title="Substituir dados atuais?"
        description={
          importPreview
            ? `O arquivo ${importPreview.fileName} contém ${importPreview.totalRecords} registros de ${importPreview.babyName}. Os dados atuais do bebê serão substituídos por este backup.`
            : "Os dados atuais do bebe serao substituidos por este backup."
        }
        confirmLabel="Importar backup"
        cancelLabel="Cancelar"
        variant="primary"
        isLoading={isImporting}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDeleteAllData}
        title="Apagar todos os registros?"
        description="Essa acao vai limpar todos os registros deste bebe no aparelho e no Supabase. Para continuar, digite EXCLUIR."
        confirmLabel="Apagar tudo"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeletingAllData}
        confirmDisabled={deleteConfirmationValue.trim() !== "EXCLUIR"}
      >
        <div className="rounded-2xl border border-[#CD8282]/20 bg-[#CD8282]/5 p-4">
          <label
            htmlFor="delete-confirmation"
            className="font-data text-[10px] uppercase tracking-[0.16em] text-[#CD8282] block mb-2"
          >
            Digite EXCLUIR
          </label>
          <input
            id="delete-confirmation"
            type="text"
            value={deleteConfirmationValue}
            onChange={(event) => setDeleteConfirmationValue(event.target.value)}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-2xl border border-[#CD8282]/20 bg-surface-container-high px-4 py-3 font-data text-sm text-text-primary outline-none transition-colors focus:border-[#CD8282]/50"
            placeholder="EXCLUIR"
          />
        </div>
      </ConfirmModal>

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
