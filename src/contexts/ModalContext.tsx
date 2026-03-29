"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

interface ModalContextValue {
  activeModals: number;
  openModal: () => () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModals, setActiveModals] = useState(0);

  const openModal = useCallback(() => {
    setActiveModals((prev) => prev + 1);
    return () => setActiveModals((prev) => prev - 1);
  }, []);

  const value = useMemo(
    () => ({ activeModals, openModal }),
    [activeModals, openModal]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
