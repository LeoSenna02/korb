"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useGrowthData } from "../hooks/useGrowthData";
import type { GrowthRecordDisplay } from "../types";
import { GrowthSummaryCards } from "./GrowthSummaryCards";
import { GrowthMetricChart } from "./GrowthMetricChart";
import { GrowthRecordsList } from "./GrowthRecordsList";
import { GrowthEmptyState } from "./GrowthEmptyState";
import { GrowthDetailHeader } from "./GrowthDetailHeader";
import { GrowthRegistrySheet } from "@/features/dashboard/components/GrowthRegistrySheet";
import { ConfirmModal } from "@/components/ui";
import { deleteGrowth } from "@/lib/db/repositories/growth";

export function GrowthClientWrapper() {
  const {
    summary,
    weightSeries,
    heightSeries,
    cephalicSeries,
    weightReference,
    heightReference,
    cephalicReference,
    displayRecords,
    isLoading,
    refresh,
  } = useGrowthData();
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GrowthRecordDisplay | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const handleCreateOpen = useCallback(() => {
    setEditingRecord(null);
    setIsRegistryOpen(true);
  }, []);

  const handleEditRequest = useCallback((record: GrowthRecordDisplay) => {
    setEditingRecord(record);
    setIsRegistryOpen(true);
  }, []);

  const handleRegistryClose = useCallback(() => {
    setIsRegistryOpen(false);
    setEditingRecord(null);
  }, []);

  const handleDeleteRequest = useCallback((recordId: string) => {
    setConfirmTarget(recordId);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;

    setDeletingId(confirmTarget);
    setConfirmTarget(null);

    try {
      await deleteGrowth(confirmTarget);
      refresh();
    } catch (error) {
      console.error("[GrowthClientWrapper] Delete error:", error);
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, refresh]);

  if (isLoading) {
    return (
      <>
        <GrowthDetailHeader onCreate={handleCreateOpen} />
        <main className="px-6 pb-36 space-y-2">
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-text-disabled border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </>
    );
  }

  if (summary.totalRecords === 0) {
    return (
      <>
        <GrowthDetailHeader onCreate={handleCreateOpen} />
        <main className="px-6 pb-36 space-y-2">
          <GrowthEmptyState onRegister={handleCreateOpen} />
        </main>
        <GrowthRegistrySheet
          editingRecord={editingRecord}
          isOpen={isRegistryOpen}
          onClose={handleRegistryClose}
          onSaved={refresh}
        />
      </>
    );
  }

  return (
    <>
      <GrowthDetailHeader onCreate={handleCreateOpen} />
      <main className="px-6 pb-36 space-y-2">
        <motion.div
          key={summary.totalRecords}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GrowthSummaryCards summary={summary} />

          <GrowthMetricChart
            title="Peso"
            subtitle="Evolucao do peso ao longo do tempo"
            reference={weightReference}
            series={weightSeries}
            color="#8EAF96"
            unit="kg"
          />

          <GrowthMetricChart
            title="Altura"
            subtitle="Evolucao da altura ao longo do tempo"
            reference={heightReference}
            series={heightSeries}
            color="#B48EAD"
            unit="cm"
          />

          <GrowthMetricChart
            title="Perimetro Cefalico"
            subtitle="Evolucao do perimetro cefalico"
            reference={cephalicReference}
            series={cephalicSeries}
            color="#D2B59D"
            unit="cm"
          />

          <GrowthRecordsList
            records={displayRecords}
            deletingId={deletingId}
            onDelete={handleDeleteRequest}
            onEdit={handleEditRequest}
          />
        </motion.div>
      </main>
      <GrowthRegistrySheet
        editingRecord={editingRecord}
        isOpen={isRegistryOpen}
        onClose={handleRegistryClose}
        onSaved={refresh}
      />

      <ConfirmModal
        isOpen={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir medicao"
        description="Essa acao nao pode ser desfeita. A medicao sera removida permanentemente dos registros do bebe."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={deletingId !== null}
      />
    </>
  );
}
