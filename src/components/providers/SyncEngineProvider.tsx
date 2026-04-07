"use client";

import { useEffect } from "react";
import { syncEngine } from "@/lib/sync/engine";

export function SyncEngineProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    syncEngine.startOnlineListener();
  }, []);

  return <>{children}</>;
}
