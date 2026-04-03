import type {
  AppSettings,
  BabyBackupPayload,
  ImportPreview,
} from "../types";

export const APP_SETTINGS_STORAGE_KEY = "korb:settings";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  soundEnabled: true,
  darkMode: true,
  language: "pt-BR",
  weightUnit: "kg",
  volumeUnit: "ml",
};

export function normalizeAppSettings(
  settings: Partial<AppSettings> | null | undefined
): AppSettings {
  return {
    ...DEFAULT_APP_SETTINGS,
    ...settings,
  };
}

export function readAppSettings(): AppSettings {
  if (typeof window === "undefined") {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_APP_SETTINGS;
    }

    return normalizeAppSettings(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function writeAppSettings(settings: AppSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    APP_SETTINGS_STORAGE_KEY,
    JSON.stringify(normalizeAppSettings(settings))
  );
}

export async function readFileText(file: File): Promise<string> {
  return file.text();
}

export function buildBackupFilename(exportedAt: string): string {
  const safeTimestamp = exportedAt.replace(/[:.]/g, "-");
  return `korb-backup-${safeTimestamp}.json`;
}

export function downloadBackupFile(payload: BabyBackupPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = buildBackupFilename(payload.exportedAt);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function createImportPreview(
  fileName: string,
  payload: BabyBackupPayload
): ImportPreview {
  const counts = {
    totalFeedings: payload.records.feedings.length,
    totalSleeps: payload.records.sleeps.length,
    totalDiapers: payload.records.diapers.length,
    totalGrowth: payload.records.growth.length,
    totalMilestones: payload.records.milestones.length,
  };

  return {
    fileName,
    babyName: payload.baby.name,
    exportedAt: payload.exportedAt,
    totalRecords:
      counts.totalFeedings +
      counts.totalSleeps +
      counts.totalDiapers +
      counts.totalGrowth +
      counts.totalMilestones,
    counts,
  };
}
