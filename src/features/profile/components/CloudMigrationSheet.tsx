"use client";

import { motion } from "framer-motion";
import { Cloud, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import type { MigrationProgress, MigrationStage } from "../hooks/useCloudMigration";

const STAGE_LABELS: Record<MigrationStage, string> = {
  idle: "Aguardando",
  preparing: "Preparando dados...",
  babies: "Enviando perfil do bebê...",
  feedings: "Enviando mamadas...",
  diapers: "Enviando fraldas...",
  growth: "Enviando medições...",
  sleeps: "Enviando registros de sono...",
  milestones: "Enviando marcos...",
  vaccines: "Enviando vacinas...",
  appointments: "Enviando consultas...",
  done: "Migração concluída!",
  error: "Erro na migração",
};

const STAGE_ORDER: MigrationStage[] = [
  "preparing",
  "babies",
  "feedings",
  "diapers",
  "growth",
  "sleeps",
  "milestones",
  "vaccines",
  "appointments",
  "done",
];

function stageIndex(stage: MigrationStage): number {
  return STAGE_ORDER.indexOf(stage);
}

interface CloudMigrationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  progress: MigrationProgress;
  onMigrate: () => void;
  onReset: () => void;
}

export function CloudMigrationSheet({
  isOpen,
  onClose,
  progress,
  onMigrate,
  onReset,
}: CloudMigrationSheetProps) {
  const isRunning =
    progress.stage !== "idle" &&
    progress.stage !== "done" &&
    progress.stage !== "error";
  const isDone = progress.stage === "done";
  const isError = progress.stage === "error";

  const currentIdx = stageIndex(progress.stage);
  const totalStages = STAGE_ORDER.length - 1; // exclude "done"
  const overallPercent = isDone
    ? 100
    : currentIdx < 0
    ? 0
    : Math.round((currentIdx / totalStages) * 100);

  function handleClose() {
    if (isRunning) return;
    if (!isDone) onReset();
    onClose();
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Backup na Nuvem"
      subtitle="MIGRAÇÃO DE DADOS"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 pb-8"
      >
        {isDone ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-[#8EAF96]/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#8EAF96]" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-text-primary">
                Dados migrados com sucesso
              </p>
              <p className="font-data text-xs text-text-secondary mt-1">
                Seus registros estão agora no Supabase e serão sincronizados automaticamente.
              </p>
            </div>
            <button
              onClick={() => { onReset(); onClose(); }}
              className="mt-2 px-8 py-3 bg-[#8EAF96] text-[#1E2024] font-display font-semibold rounded-2xl"
            >
              Fechar
            </button>
          </motion.div>
        ) : isError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6 gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-[#CD8282]/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-[#CD8282]" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="font-display text-base font-semibold text-text-primary">
                Erro na migração
              </p>
              {progress.error && (
                <p className="font-data text-xs text-[#CD8282] mt-2 px-4">
                  {progress.error}
                </p>
              )}
            </div>
            <button
              onClick={onReset}
              className="px-8 py-3 bg-surface-container text-text-primary font-display font-semibold rounded-2xl"
            >
              Tentar novamente
            </button>
          </motion.div>
        ) : (
          <>
            {/* Description */}
            {progress.stage === "idle" && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-container">
                  <Cloud className="w-5 h-5 text-[#8EAF96] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="font-display text-sm font-medium text-text-primary">
                      Enviar dados para a nuvem
                    </p>
                    <p className="font-data text-xs text-text-secondary mt-1 leading-relaxed">
                      Todos os seus registros locais (mamadas, fraldas, sono, crescimento, marcos, vacinas e consultas)
                      serão enviados para o Supabase. A operação é segura e pode ser repetida sem duplicar dados.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress */}
            {isRunning && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-[#8EAF96] animate-spin flex-shrink-0" strokeWidth={1.5} />
                  <p className="font-data text-sm text-text-primary">
                    {STAGE_LABELS[progress.stage]}
                  </p>
                </div>

                {/* Overall bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-data text-[10px] text-text-disabled uppercase tracking-wider">
                      Progresso geral
                    </span>
                    <span className="font-data text-[10px] text-[#8EAF96]">
                      {overallPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#8EAF96]"
                      initial={{ width: 0 }}
                      animate={{ width: `${overallPercent}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>

                {/* Per-stage record count */}
                {progress.total > 0 && (
                  <p className="font-data text-xs text-text-secondary text-center">
                    {progress.current} / {progress.total} registros
                  </p>
                )}
              </div>
            )}

            {/* Start button */}
            {progress.stage === "idle" && (
              <button
                onClick={onMigrate}
                className="w-full h-16 bg-[#8EAF96] hover:bg-[#7D9F85] active:scale-[0.98] text-[#1E2024] font-display font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-[#8EAF96]/10"
              >
                <Cloud className="w-5 h-5" strokeWidth={2} />
                Iniciar Migração
              </button>
            )}
          </>
        )}
      </motion.div>
    </Sheet>
  );
}
