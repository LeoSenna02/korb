"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuthContext } from "./AuthContext";
import type { Baby } from "@/lib/db/types";
import { saveBaby as dbSaveBaby, getBabyByUserId, updateBaby as dbUpdateBaby } from "@/lib/db/repositories/baby";

interface BabyContextValue {
  baby: Baby | null;
  isLoading: boolean;
  isHydrated: boolean;
  saveBaby: (data: Omit<Baby, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<Baby>;
  updateBaby: (data: Partial<Omit<Baby, "id" | "userId" | "createdAt">>) => Promise<Baby>;
  refreshBaby: () => Promise<void>;
}

const BabyContext = createContext<BabyContextValue | null>(null);

interface BabyProviderProps {
  children: React.ReactNode;
}

export function BabyProvider({ children }: BabyProviderProps) {
  const { user, isAuthenticated, isHydrated: authHydrated } = useAuthContext();
  const [baby, setBaby] = useState<Baby | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Se o auth ainda não hidratou, não fazemos nada no baby context
    if (!authHydrated) return;

    if (!isAuthenticated || !user) {
      setBaby(null);
      setIsHydrated(true);
      return;
    }

    const userId = user.id;
    let cancelled = false;

    async function loadBaby() {
      setIsLoading(true);
      try {
        const result = await getBabyByUserId(userId);
        if (!cancelled) {
          setBaby(result);
        }
      } catch (err) {
        console.error("[BabyContext] Failed to load baby:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsHydrated(true);
        }
      }
    }

    loadBaby();

    return () => {
      cancelled = true;
    };
  }, [authHydrated, isAuthenticated, user]);

  const refreshBaby = useCallback(async () => {
    if (!user) return;
    try {
      const result = await getBabyByUserId(user.id);
      setBaby(result);
    } catch (err) {
      console.error("[BabyContext] Failed to refresh baby:", err);
    }
  }, [user]);

  const handleSaveBaby = useCallback(
    async (data: Omit<Baby, "id" | "userId" | "createdAt" | "updatedAt">) => {
      if (!user) throw new Error("User not authenticated");
      setIsLoading(true);
      try {
        const saved = await dbSaveBaby({
          ...data,
          userId: user.id,
        });
        setBaby(saved);
        return saved;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const handleUpdateBaby = useCallback(
    async (data: Partial<Omit<Baby, "id" | "userId" | "createdAt">>) => {
      if (!baby) throw new Error("No baby to update");
      setIsLoading(true);
      try {
        const updated = await dbUpdateBaby(baby.id, data);
        setBaby(updated);
        return updated;
      } finally {
        setIsLoading(false);
      }
    },
    [baby]
  );

  const value = useMemo<BabyContextValue>(
    () => ({
      baby,
      isLoading,
      isHydrated,
      saveBaby: handleSaveBaby,
      updateBaby: handleUpdateBaby,
      refreshBaby,
    }),
    [baby, isLoading, isHydrated, handleSaveBaby, handleUpdateBaby, refreshBaby]
  );

  return <BabyContext.Provider value={value}>{children}</BabyContext.Provider>;
}

export function useBaby(): BabyContextValue {
  const ctx = React.use(BabyContext);
  if (!ctx) {
    throw new Error("useBaby must be used inside BabyProvider");
  }
  return ctx;
}
