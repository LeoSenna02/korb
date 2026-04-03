"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { getAgeInCompletedMonths } from "@/lib/utils/format";
import { getVaccinesByBabyId } from "@/lib/db/repositories/vaccine";
import { OFFICIAL_VACCINES, formatScheduledMonthLabel } from "../constants";
import type {
  VaccineMonthGroup,
  VaccineRecord,
  VaccineTimelineItem,
} from "../types";

function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStatus(
  scheduledMonth: number,
  ageInMonths: number,
  appliedDate?: string
) {
  if (appliedDate) {
    return "taken" as const;
  }

  if (scheduledMonth > ageInMonths) {
    return "locked" as const;
  }

  return "pending" as const;
}

interface UseVaccinesReturn {
  months: VaccineMonthGroup[];
  isLoading: boolean;
  refresh: () => void;
}

export function useVaccines(): UseVaccinesReturn {
  const { baby } = useBaby();
  const [records, setRecords] = useState<VaccineRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!baby) {
      setRecords([]);
      setIsLoading(false);
      return;
    }

    const currentBabyId = baby.id;
    let cancelled = false;

    async function loadVaccines() {
      setIsLoading(true);

      try {
        const result = await getVaccinesByBabyId(currentBabyId);
        if (!cancelled) {
          setRecords(result);
        }
      } catch (error) {
        console.error("[useVaccines] Failed to load:", error);
        if (!cancelled) {
          setRecords([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadVaccines();

    return () => {
      cancelled = true;
    };
  }, [baby, refreshKey]);

  const months = useMemo<VaccineMonthGroup[]>(() => {
    if (!baby) {
      return [];
    }

    const ageInMonths =
      getAgeInCompletedMonths(baby.birthDate, getTodayLocalDate()) ?? 0;
    const officialRecordMap = new Map(
      records
        .filter((record) => !record.isCustom)
        .map((record) => [record.vaccineId, record] as const)
    );

    const officialItems: VaccineTimelineItem[] = OFFICIAL_VACCINES.map((item) => {
      const record = officialRecordMap.get(item.id);

      return {
        id: item.id,
        vaccineId: item.id,
        name: item.name,
        doseLabel: item.doseLabel,
        scheduledMonth: item.scheduledMonth,
        appliedDate: record?.appliedDate,
        appliedLocation: record?.appliedLocation,
        notes: record?.notes,
        isCustom: false,
        status: getStatus(item.scheduledMonth, ageInMonths, record?.appliedDate),
        sortOrder: item.sortOrder,
        recordId: record?.id,
        createdAt: record?.createdAt,
      };
    });

    const customItems: VaccineTimelineItem[] = records
      .filter((record) => record.isCustom)
      .map((record) => ({
        id: record.id,
        vaccineId: record.vaccineId,
        name: record.name,
        doseLabel: record.doseLabel,
        scheduledMonth: record.scheduledMonth,
        appliedDate: record.appliedDate,
        appliedLocation: record.appliedLocation,
        notes: record.notes,
        isCustom: true,
        status: getStatus(
          record.scheduledMonth,
          ageInMonths,
          record.appliedDate
        ),
        sortOrder: Number.MAX_SAFE_INTEGER,
        recordId: record.id,
        createdAt: record.createdAt,
      }));

    const grouped = new Map<number, VaccineTimelineItem[]>();

    for (const item of [...officialItems, ...customItems]) {
      const monthItems = grouped.get(item.scheduledMonth) ?? [];
      monthItems.push(item);
      grouped.set(item.scheduledMonth, monthItems);
    }

    return Array.from(grouped.entries())
      .sort(([monthA], [monthB]) => monthA - monthB)
      .map(([month, items]) => {
        const sortedItems = [...items].sort((itemA, itemB) => {
          if (itemA.isCustom !== itemB.isCustom) {
            return itemA.isCustom ? 1 : -1;
          }

          if (!itemA.isCustom && !itemB.isCustom) {
            return itemA.sortOrder - itemB.sortOrder;
          }

          return (itemA.createdAt ?? "").localeCompare(itemB.createdAt ?? "");
        });

        const summary = sortedItems.reduce(
          (acc, item) => {
            acc.total += 1;
            acc[item.status] += 1;
            return acc;
          },
          { total: 0, taken: 0, pending: 0, locked: 0 }
        );

        return {
          month,
          label: formatScheduledMonthLabel(month),
          summary,
          items: sortedItems,
        };
      });
  }, [baby, records]);

  return {
    months,
    isLoading,
    refresh,
  };
}
