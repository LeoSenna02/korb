"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal, LoadingScreen } from "@/components/ui";
import { useBaby } from "@/contexts/BabyContext";
import { useAuth } from "@/lib/auth/hooks";
import type { SymptomEpisode } from "@/lib/db/types";
import { deleteSymptomEpisode } from "@/lib/sync/repositories/symptom";
import { useSymptoms } from "../hooks/useSymptoms";
import { ActiveEpisodesSection } from "./ActiveEpisodesSection";
import { ResolveSymptomEpisodeSheet } from "./ResolveSymptomEpisodeSheet";
import { ResolvedEpisodesSection } from "./ResolvedEpisodesSection";
import { SymptomEpisodeSheet } from "./SymptomEpisodeSheet";
import { SymptomsEmptyState } from "./SymptomsEmptyState";
import { SymptomsHeader } from "./SymptomsHeader";

export function SymptomsClient() {
  const router = useRouter();
  const { isAuthenticated, isHydrated: authHydrated } = useAuth();
  const { baby, isHydrated: babyHydrated } = useBaby();
  const { activeEpisodes, resolvedEpisodes, summary, isLoading, refresh } =
    useSymptoms();
  const [isEpisodeSheetOpen, setIsEpisodeSheetOpen] = useState(false);
  const [isResolveSheetOpen, setIsResolveSheetOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<SymptomEpisode | null>(
    null
  );
  const [resolvingEpisode, setResolvingEpisode] = useState<SymptomEpisode | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<SymptomEpisode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (authHydrated && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (authHydrated && babyHydrated && !baby) {
      router.replace("/baby");
    }
  }, [authHydrated, babyHydrated, isAuthenticated, baby, router]);

  function handleCreateOpen() {
    setEditingEpisode(null);
    setIsEpisodeSheetOpen(true);
  }

  function handleEditEpisode(episode: SymptomEpisode) {
    setEditingEpisode(episode);
    setIsEpisodeSheetOpen(true);
  }

  function handleResolveEpisode(episode: SymptomEpisode) {
    setResolvingEpisode(episode);
    setIsResolveSheetOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteSymptomEpisode(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
    } catch (error) {
      console.error("[SymptomsClient] Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  const dataReady = authHydrated && babyHydrated;

  if (!dataReady || isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !baby) {
    return null;
  }

  const hasEpisodes = activeEpisodes.length > 0 || resolvedEpisodes.length > 0;

  return (
    <>
      <main className="space-y-8 px-6 pt-4 pb-32">
        <SymptomsHeader summary={summary} onCreate={handleCreateOpen} />

        {hasEpisodes ? (
          <>
            <ActiveEpisodesSection
              episodes={activeEpisodes}
              onEdit={handleEditEpisode}
              onResolve={handleResolveEpisode}
              onDelete={setDeleteTarget}
              onGoToConsultas={() => router.push("/dashboard/consultas")}
            />

            <ResolvedEpisodesSection
              episodes={resolvedEpisodes}
              onDelete={setDeleteTarget}
            />
          </>
        ) : (
          <SymptomsEmptyState onCreate={handleCreateOpen} />
        )}
      </main>

      <SymptomEpisodeSheet
        isOpen={isEpisodeSheetOpen}
        onClose={() => {
          setIsEpisodeSheetOpen(false);
          setEditingEpisode(null);
        }}
        babyId={baby.id}
        episode={editingEpisode}
        onSaved={refresh}
      />

      <ResolveSymptomEpisodeSheet
        isOpen={isResolveSheetOpen}
        onClose={() => {
          setIsResolveSheetOpen(false);
          setResolvingEpisode(null);
        }}
        episode={resolvingEpisode}
        onResolved={refresh}
      />

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir episodio"
        description="Esse episodio sera removido permanentemente do historico do bebe."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
