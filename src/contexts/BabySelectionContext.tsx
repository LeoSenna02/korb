"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

interface BabySelectionContextValue {
  selectedBabyId: string | null;
  setSelectedBabyId: (id: string) => void;
}

const STORAGE_KEY = "korb:selected_baby_id";

const BabySelectionContext = createContext<BabySelectionContextValue | null>(null);

export function BabySelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedBabyId, setSelectedBabyIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  const setSelectedBabyId = useCallback((id: string) => {
    setSelectedBabyIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const value = useMemo<BabySelectionContextValue>(
    () => ({ selectedBabyId, setSelectedBabyId }),
    [selectedBabyId, setSelectedBabyId]
  );

  return (
    <BabySelectionContext.Provider value={value}>
      {children}
    </BabySelectionContext.Provider>
  );
}

export function useBabySelection(): BabySelectionContextValue {
  const ctx = React.use(BabySelectionContext);
  if (!ctx) {
    throw new Error("useBabySelection must be used inside BabySelectionProvider");
  }
  return ctx;
}
