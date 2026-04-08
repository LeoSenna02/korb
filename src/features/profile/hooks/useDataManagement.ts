"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type RefObject } from "react";
import { useBaby } from "@/contexts/BabyContext";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  clearBabyData,
  createBabyBackupSnapshot,
  replaceBabyDataFromBackup,
} from "@/lib/db/repositories";
import { createClient } from "@/lib/supabase/client";
import { useSleep } from "@/contexts/SleepContext";
import { useFeedingTimer } from "@/features/dashboard/hooks/useFeedingTimer";
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
  canDeleteAllData: boolean;
  isCheckingDeleteAccess: boolean;
  isExporting: boolean;
  isPreparingImport: boolean;
  isImporting: boolean;
  isDeletingAllData: boolean;
  importPreview: ImportPreview | null;
  isConfirmOpen: boolean;
  isDeleteConfirmOpen: boolean;
  deleteConfirmationValue: string;
  exportData: () => Promise<void>;
  openImportPicker: () => void;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  cancelImport: () => void;
  confirmImport: () => Promise<void>;
  openDeleteConfirm: () => void;
  closeDeleteConfirm: () => void;
  setDeleteConfirmationValue: (value: string) => void;
  confirmDeleteAllData: () => Promise<void>;
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
  const { user } = useAuthContext();
  const { stopSleep } = useSleep();
  const { reset: resetFeedingTimer } = useFeedingTimer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [canDeleteAllData, setCanDeleteAllData] = useState(false);
  const [isCheckingDeleteAccess, setIsCheckingDeleteAccess] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreparingImport, setIsPreparingImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeletingAllData, setIsDeletingAllData] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImportState | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteConfirmationValue, setDeleteConfirmationValueState] = useState("");

  useEffect(() => {
    if (!baby || !user) {
      setCanDeleteAllData(false);
      setIsCheckingDeleteAccess(false);
      return;
    }

    let cancelled = false;

    async function loadDeleteAccess() {
      const currentBaby = baby;
      const currentUser = user;
      if (!currentBaby || !currentUser) {
        setCanDeleteAllData(false);
        setIsCheckingDeleteAccess(false);
        return;
      }
      setIsCheckingDeleteAccess(true);

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("baby_caregivers")
          .select("role")
          .eq("baby_id", currentBaby.id)
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!cancelled) {
          const role = data?.role ?? null;
          setCanDeleteAllData(role === "owner" || role === "admin");
        }
      } catch (error) {
        console.error("[useDataManagement] Failed to load delete access:", error);
        if (!cancelled) {
          setCanDeleteAllData(false);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingDeleteAccess(false);
        }
      }
    }

    void loadDeleteAccess();

    return () => {
      cancelled = true;
    };
  }, [baby, user]);

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

  const openDeleteConfirm = useCallback(() => {
    setFeedback(null);
    setDeleteConfirmationValueState("");
    setIsDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    if (isDeletingAllData) {
      return;
    }

    setIsDeleteConfirmOpen(false);
    setDeleteConfirmationValueState("");
  }, [isDeletingAllData]);

  const setDeleteConfirmationValue = useCallback((value: string) => {
    setDeleteConfirmationValueState(value.toUpperCase());
  }, []);

  const confirmDeleteAllData = useCallback(async () => {
    if (!baby || !user) {
      setFeedback({
        type: "error",
        message: "Nao encontramos uma familia ativa para limpar os dados.",
      });
      return;
    }

    if (!canDeleteAllData) {
      setFeedback({
        type: "error",
        message: "Somente o administrador da familia pode apagar todos os dados.",
      });
      return;
    }

    if (deleteConfirmationValue.trim() !== "EXCLUIR") {
      setFeedback({
        type: "error",
        message: 'Digite EXCLUIR para confirmar esta acao.',
      });
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setFeedback({
        type: "error",
        message: "Conecte-se a internet para apagar os dados da nuvem com seguranca.",
      });
      return;
    }

    setIsDeletingAllData(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      const { data: membership, error: membershipError } = await supabase
        .from("baby_caregivers")
        .select("role")
        .eq("baby_id", baby.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (membershipError) {
        throw membershipError;
      }

      const role = membership?.role ?? null;
      if (role !== "owner" && role !== "admin") {
        throw new Error("Somente o administrador da familia pode apagar todos os dados.");
      }

      const deleteAppointments = await supabase
        .from("appointments")
        .delete()
        .eq("baby_id", baby.id);
      if (deleteAppointments.error) {
        throw deleteAppointments.error;
      }

      const deleteSymptoms = await supabase
        .from("symptom_episodes" as never)
        .delete()
        .eq("baby_id" as never, baby.id);
      if (deleteSymptoms.error) {
        throw deleteSymptoms.error;
      }

      const deleteOperations = await Promise.all([
        supabase.from("feedings").delete().eq("baby_id", baby.id),
        supabase.from("diapers").delete().eq("baby_id", baby.id),
        supabase.from("growth").delete().eq("baby_id", baby.id),
        supabase.from("sleeps").delete().eq("baby_id", baby.id),
        supabase.from("milestones").delete().eq("baby_id", baby.id),
        supabase.from("vaccines").delete().eq("baby_id", baby.id),
      ]);

      for (const operation of deleteOperations) {
        if (operation.error) {
          throw operation.error;
        }
      }

      stopSleep();
      resetFeedingTimer();
      await clearBabyData(baby);
      await refreshBaby();
      onImported?.();

      setFeedback({
        type: "success",
        message: "Todos os registros desta familia foram apagados com sucesso.",
      });
      setIsDeleteConfirmOpen(false);
      setDeleteConfirmationValueState("");
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsDeletingAllData(false);
    }
  }, [
    baby,
    user,
    canDeleteAllData,
    deleteConfirmationValue,
    stopSleep,
    resetFeedingTimer,
    refreshBaby,
    onImported,
  ]);

  return {
    fileInputRef,
    feedback,
    canDeleteAllData,
    isCheckingDeleteAccess,
    isExporting,
    isPreparingImport,
    isImporting,
    isDeletingAllData,
    importPreview: pendingImport?.preview ?? null,
    isConfirmOpen,
    isDeleteConfirmOpen,
    deleteConfirmationValue,
    exportData,
    openImportPicker,
    handleFileChange,
    cancelImport,
    confirmImport,
    openDeleteConfirm,
    closeDeleteConfirm,
    setDeleteConfirmationValue,
    confirmDeleteAllData,
  };
}
