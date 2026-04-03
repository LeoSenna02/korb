"use client";

import { useState, useCallback, useMemo, useSyncExternalStore } from "react";
import type { AppSettings } from "../types";
import {
  DEFAULT_APP_SETTINGS,
  readAppSettings,
  writeAppSettings,
} from "../utils/data-transfer";

function subscribeToHydration(): () => void {
  return () => {};
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => readAppSettings());
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      writeAppSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_APP_SETTINGS);
    writeAppSettings(DEFAULT_APP_SETTINGS);
  }, []);

  return useMemo(
    () => ({ settings, updateSetting, resetSettings, isHydrated }),
    [settings, updateSetting, resetSettings, isHydrated],
  );
}
