"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useBaby } from "@/contexts/BabyContext";
import { useAuth } from "@/lib/auth/hooks";
import { useVaccines } from "../hooks/useVaccines";
import { AddCustomVaccineButton } from "./AddCustomVaccineButton";
import { VaccineMonthSection } from "./VaccineMonthSection";
import { VaccineSheet } from "./VaccineSheet";
import { VaccinesHeader } from "./VaccinesHeader";
import type { VaccineSheetMode, VaccineTimelineItem } from "../types";

export function VaccinesClient() {
  const router = useRouter();
  const { isAuthenticated, isHydrated: authHydrated } = useAuth();
  const { baby, isHydrated: babyHydrated } = useBaby();
  const { months, isLoading, refresh } = useVaccines();
  const [sheetMode, setSheetMode] = useState<VaccineSheetMode>("custom-create");
  const [selectedItem, setSelectedItem] = useState<VaccineTimelineItem | undefined>();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (authHydrated && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (authHydrated && babyHydrated && !baby) {
      router.replace("/baby");
    }
  }, [authHydrated, babyHydrated, isAuthenticated, baby, router]);

  const dataReady = authHydrated && babyHydrated;

  const summary = useMemo(() => {
    return months.reduce(
      (acc, month) => {
        acc.totalVaccines += month.summary.total;
        acc.takenVaccines += month.summary.taken;
        acc.pendingVaccines += month.summary.pending;
        acc.lockedVaccines += month.summary.locked;
        return acc;
      },
      {
        totalVaccines: 0,
        takenVaccines: 0,
        pendingVaccines: 0,
        lockedVaccines: 0,
      }
    );
  }, [months]);

  function handleOpenItem(item: VaccineTimelineItem) {
    setSelectedItem(item);
    setSheetMode(item.isCustom ? "custom-edit" : "official-record");
    setIsSheetOpen(true);
  }

  function handleOpenCustomCreate() {
    setSelectedItem(undefined);
    setSheetMode("custom-create");
    setIsSheetOpen(true);
  }

  function handleCloseSheet() {
    setIsSheetOpen(false);
    setSelectedItem(undefined);
    setSheetMode("custom-create");
  }

  if (!dataReady || isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !baby) {
    return null;
  }

  return (
    <>
      <main className="px-6 pt-4 pb-32 space-y-8">
        <VaccinesHeader {...summary} />

        {months.length === 0 ? (
          <div className="rounded-[28px] bg-surface-container-low border border-surface-variant/20 p-6">
            <h2 className="font-display text-2xl text-text-primary font-semibold">
              Nenhuma vacina disponivel
            </h2>
            <p className="font-data text-sm text-text-secondary mt-3">
              Ainda nao foi possivel montar a linha do tempo vacinal deste bebe.
            </p>
          </div>
        ) : (
          months.map((month) => (
            <VaccineMonthSection
              key={month.month}
              month={month}
              onSelect={handleOpenItem}
            />
          ))
        )}
      </main>

      <AddCustomVaccineButton onClick={handleOpenCustomCreate} />

      <VaccineSheet
        babyId={baby.id}
        isOpen={isSheetOpen}
        mode={sheetMode}
        item={selectedItem}
        onClose={handleCloseSheet}
        onSaved={refresh}
      />
    </>
  );
}
