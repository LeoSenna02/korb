"use client";

import { useCallback, useRef, useState, type ChangeEvent, type RefObject } from "react";
import { useBaby } from "@/contexts/BabyContext";
import {
  createBabyBackupSnapshot,
  replaceBabyDataFromBackup,
} from "@/lib/db/repositories";
import type { BabyBackupPayload, ImportPreview } from "../types";
import { babyBackupPayloadSchema } from "../validation";
import {
  createImportPreview,
  downloadBackupFile,
  readAppSettings,
  readFileText,
  writeAppSettings,
} from "../utils/data-transfer";
import type { ZodError } from "zod";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

interface PendingImportState {
  payload: BabyBackupPayload;
  preview: ImportPreview;
}

interface UseDataManagementOptions {
  onImported?: () => void;
}

interface UseDataManagementReturn {
  fileInputRef: RefObject<HTMLInputElement | null>;
  feedback: FeedbackState | null;
  isExporting: boolean;
  isPreparingImport: boolean;
  isImporting: boolean;
  importPreview: ImportPreview | null;
  isConfirmOpen: boolean;
  exportData: () => Promise<void>;
  openImportPicker: () => void;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  cancelImport: () => void;
  confirmImport: () => Promise<void>;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Nao foi possivel concluir esta acao.";
}

function getValidationErrorMessage(error: ZodError): string {
  const issues = error.issues.slice(0, 3).map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "arquivo";
    return `${path}: ${issue.message}`;
  });

  return `Arquivo invalido. Ajuste estes campos: ${issues.join(" | ")}`;
}

export function useDataManagement({
  onImported,
}: UseDataManagementOptions = {}): UseDataManagementReturn {
  const { baby, refreshBaby } = useBaby();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreparingImport, setIsPreparingImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImportState | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const cancelImport = useCallback(() => {
    setIsConfirmOpen(false);
    setPendingImport(null);
    resetFileInput();
  }, [resetFileInput]);

  const exportData = useCallback(async () => {
    if (!baby) {
      setFeedback({
        type: "error",
        message: "Nao encontramos um bebe ativo para exportar.",
      });
      return;
    }

    setIsExporting(true);
    setFeedback(null);

    try {
      const payload = await createBabyBackupSnapshot(baby, readAppSettings());
      downloadBackupFile(payload);
      setFeedback({
        type: "success",
        message: "Backup JSON exportado com sucesso.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsExporting(false);
    }
  }, [baby]);

  const openImportPicker = useCallback(() => {
    setFeedback(null);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      setIsPreparingImport(true);
      setFeedback(null);

      try {
        const text = await readFileText(file);
        const parsedJson = JSON.parse(text) as unknown;
        const parsedPayload = babyBackupPayloadSchema.safeParse(parsedJson);

        if (!parsedPayload.success) {
          throw new Error(getValidationErrorMessage(parsedPayload.error));
        }

        const preview = createImportPreview(file.name, parsedPayload.data);
        setPendingImport({
          payload: parsedPayload.data,
          preview,
        });
        setIsConfirmOpen(true);
      } catch (error) {
        setFeedback({
          type: "error",
          message: getErrorMessage(error),
        });
        resetFileInput();
      } finally {
        setIsPreparingImport(false);
      }
    },
    [resetFileInput]
  );

  const confirmImport = useCallback(async () => {
    if (!baby || !pendingImport) {
      setFeedback({
        type: "error",
        message: "Nao encontramos um bebe ativo para importar.",
      });
      setIsConfirmOpen(false);
      setPendingImport(null);
      return;
    }

    setIsImporting(true);
    setFeedback(null);

    try {
      await replaceBabyDataFromBackup(baby, pendingImport.payload);
      writeAppSettings(pendingImport.payload.settings);
      await refreshBaby();
      onImported?.();
      setFeedback({
        type: "success",
        message: "Dados restaurados com sucesso a partir do arquivo JSON.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsImporting(false);
      setIsConfirmOpen(false);
      setPendingImport(null);
      resetFileInput();
    }
  }, [baby, onImported, pendingImport, refreshBaby, resetFileInput]);

  return {
    fileInputRef,
    feedback,
    isExporting,
    isPreparingImport,
    isImporting,
    importPreview: pendingImport?.preview ?? null,
    isConfirmOpen,
    exportData,
    openImportPicker,
    handleFileChange,
    cancelImport,
    confirmImport,
  };
}
