"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAppointmentLinkSuggestions,
  markAppointmentAsAttended,
} from "@/lib/db/repositories/appointment";
import { getGrowthById } from "@/lib/db/repositories/growth";
import {
  formatWeightKgForInput,
  parseDecimalInput,
  parseWeightInputToKg,
  sanitizeDecimalInput,
  sanitizeWeightInput,
} from "@/features/dashboard/utils/growth";
import type {
  AppointmentLinkSuggestions,
  FollowUpDraft,
  PediatricAppointment,
} from "../types";
import {
  attendAppointmentMeasurementsSchema,
  attendAppointmentSubmitSchema,
} from "../validation";
import {
  buildEmptyAttendFormValues,
  buildFollowUpDraft,
  parseFollowUpIntervalDays,
} from "../utils";

export interface AttendAppointmentSaveResult {
  followUpDraft?: FollowUpDraft;
}

interface UseAttendAppointmentFormParams {
  babyId: string;
  appointment: PediatricAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (result: AttendAppointmentSaveResult) => void;
}

interface UseAttendAppointmentFormReturn {
  postVisitNotes: string;
  followUpIntervalDays: string;
  followUpInstructions: string;
  measurementsEnabled: boolean;
  weight: string;
  height: string;
  cephalicPerimeter: string;
  linkedVaccineIds: string[];
  suggestions: AppointmentLinkSuggestions;
  isLoadingSuggestions: boolean;
  isSaving: boolean;
  formError: string | null;
  isSaveDisabled: boolean;
  setPostVisitNotes: (value: string) => void;
  setFollowUpIntervalDays: (value: string) => void;
  setFollowUpInstructions: (value: string) => void;
  toggleMeasurements: () => void;
  handleWeightChange: (value: string) => void;
  handleWeightBlur: () => void;
  handleHeightChange: (value: string) => void;
  handleCephalicPerimeterChange: (value: string) => void;
  toggleVaccineSelection: (vaccineId: string) => void;
  handleSave: () => Promise<void>;
}

function formatMetricInputValue(value?: number) {
  return value != null ? value.toFixed(1) : "";
}

function getFirstIssueMessage(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? "Nao foi possivel validar os dados da consulta.";
}

export function useAttendAppointmentForm({
  babyId,
  appointment,
  isOpen,
  onClose,
  onSaved,
}: UseAttendAppointmentFormParams): UseAttendAppointmentFormReturn {
  const initialValues = useMemo(
    () => buildEmptyAttendFormValues(appointment),
    [appointment]
  );
  const [postVisitNotes, setPostVisitNotes] = useState(initialValues.postVisitNotes);
  const [followUpIntervalDays, setFollowUpIntervalDays] = useState(
    initialValues.followUpIntervalDays
  );
  const [followUpInstructions, setFollowUpInstructions] = useState(
    initialValues.followUpInstructions
  );
  const [measurementsEnabled, setMeasurementsEnabled] = useState(
    initialValues.measurementsEnabled
  );
  const [weight, setWeight] = useState(initialValues.weight);
  const [height, setHeight] = useState(initialValues.height);
  const [cephalicPerimeter, setCephalicPerimeter] = useState(
    initialValues.cephalicPerimeter
  );
  const [linkedGrowthId, setLinkedGrowthId] = useState(initialValues.linkedGrowthId);
  const [linkedVaccineIds, setLinkedVaccineIds] = useState(initialValues.linkedVaccineIds);
  const [suggestions, setSuggestions] = useState<AppointmentLinkSuggestions>({
    growthRecords: [],
    vaccineRecords: [],
  });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetFormState = useCallback(() => {
    setPostVisitNotes(initialValues.postVisitNotes);
    setFollowUpIntervalDays(initialValues.followUpIntervalDays);
    setFollowUpInstructions(initialValues.followUpInstructions);
    setMeasurementsEnabled(initialValues.measurementsEnabled);
    setWeight(initialValues.weight);
    setHeight(initialValues.height);
    setCephalicPerimeter(initialValues.cephalicPerimeter);
    setLinkedGrowthId(initialValues.linkedGrowthId);
    setLinkedVaccineIds(initialValues.linkedVaccineIds);
    setSuggestions({ growthRecords: [], vaccineRecords: [] });
    setFormError(null);
  }, [initialValues]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    resetFormState();
  }, [isOpen, resetFormState]);

  useEffect(() => {
    if (!isOpen || !appointment) {
      return;
    }

    const currentAppointment = appointment;
    let cancelled = false;

    async function loadSuggestions() {
      setIsLoadingSuggestions(true);

      try {
        const [result, linkedGrowthRecord] = await Promise.all([
          getAppointmentLinkSuggestions(babyId, currentAppointment.scheduledAt),
          initialValues.linkedGrowthId
            ? getGrowthById(initialValues.linkedGrowthId)
            : Promise.resolve(null),
        ]);

        if (cancelled) {
          return;
        }

        setSuggestions(result);

        if (linkedGrowthRecord) {
          setMeasurementsEnabled(true);
          setLinkedGrowthId(linkedGrowthRecord.id);
          setWeight(
            linkedGrowthRecord.weightKg != null
              ? formatWeightKgForInput(linkedGrowthRecord.weightKg)
              : ""
          );
          setHeight(formatMetricInputValue(linkedGrowthRecord.heightCm));
          setCephalicPerimeter(
            formatMetricInputValue(linkedGrowthRecord.cephalicCm)
          );
        }

        if (
          initialValues.linkedVaccineIds.length === 0 &&
          result.vaccineRecords.length > 0
        ) {
          setLinkedVaccineIds(result.vaccineRecords.map((record) => record.id));
        }
      } catch (error) {
        console.error("[useAttendAppointmentForm] Suggestion load failed:", error);
        if (!cancelled) {
          setSuggestions({ growthRecords: [], vaccineRecords: [] });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSuggestions(false);
        }
      }
    }

    loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [
    appointment,
    babyId,
    initialValues.linkedGrowthId,
    initialValues.linkedVaccineIds.length,
    isOpen,
  ]);

  const toggleMeasurements = useCallback(() => {
    setMeasurementsEnabled((current) => !current);
    setFormError(null);
  }, []);

  const toggleVaccineSelection = useCallback((vaccineId: string) => {
    setLinkedVaccineIds((current) =>
      current.includes(vaccineId)
        ? current.filter((id) => id !== vaccineId)
        : [...current, vaccineId]
    );
  }, []);

  const handleWeightChange = useCallback((value: string) => {
    setWeight(sanitizeWeightInput(value));
    setFormError(null);
  }, []);

  const handleWeightBlur = useCallback(() => {
    const parsedWeight = parseWeightInputToKg(weight);

    if (parsedWeight == null) {
      return;
    }

    setWeight(formatWeightKgForInput(parsedWeight));
  }, [weight]);

  const handleHeightChange = useCallback((value: string) => {
    setHeight(sanitizeDecimalInput(value));
    setFormError(null);
  }, []);

  const handleCephalicPerimeterChange = useCallback((value: string) => {
    setCephalicPerimeter(sanitizeDecimalInput(value));
    setFormError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!appointment) {
      return;
    }

    const parsedFollowUpIntervalDays = parseFollowUpIntervalDays(followUpIntervalDays);
    const growthDataResult = measurementsEnabled
      ? attendAppointmentMeasurementsSchema.safeParse({
          measuredAt: appointment.scheduledAt,
          weightKg: parseWeightInputToKg(weight),
          heightCm: parseDecimalInput(height),
          cephalicCm: parseDecimalInput(cephalicPerimeter),
        })
      : null;

    if (growthDataResult && !growthDataResult.success) {
      setFormError(getFirstIssueMessage(growthDataResult.error));
      return;
    }

    const payloadResult = attendAppointmentSubmitSchema.safeParse({
      postVisitNotes: postVisitNotes.trim() || undefined,
      followUpIntervalDays: parsedFollowUpIntervalDays,
      followUpInstructions: followUpInstructions.trim() || undefined,
      growthData: growthDataResult?.data,
      linkedGrowthId: measurementsEnabled ? linkedGrowthId : undefined,
      linkedVaccineIds,
    });

    if (!payloadResult.success) {
      setFormError(getFirstIssueMessage(payloadResult.error));
      return;
    }

    const shouldSuggestFollowUp =
      appointment.status !== "attended" &&
      payloadResult.data.followUpIntervalDays != null;

    setIsSaving(true);
    setFormError(null);

    try {
      await markAppointmentAsAttended(appointment.id, payloadResult.data);

      onSaved({
        followUpDraft:
          shouldSuggestFollowUp
            ? buildFollowUpDraft(
                {
                  ...appointment,
                  followUpInstructions: payloadResult.data.followUpInstructions,
                },
                payloadResult.data.followUpIntervalDays as number
              )
            : undefined,
      });
      onClose();
    } catch (error) {
      console.error("[useAttendAppointmentForm] Save failed:", error);
      setFormError("Nao foi possivel salvar a conclusao da consulta.");
    } finally {
      setIsSaving(false);
    }
  }, [
    appointment,
    cephalicPerimeter,
    followUpInstructions,
    followUpIntervalDays,
    height,
    linkedGrowthId,
    linkedVaccineIds,
    measurementsEnabled,
    onClose,
    onSaved,
    postVisitNotes,
    weight,
  ]);

  const isSaveDisabled =
    isSaving ||
    (measurementsEnabled &&
      !weight.trim() &&
      !height.trim() &&
      !cephalicPerimeter.trim());

  return {
    postVisitNotes,
    followUpIntervalDays,
    followUpInstructions,
    measurementsEnabled,
    weight,
    height,
    cephalicPerimeter,
    linkedVaccineIds,
    suggestions,
    isLoadingSuggestions,
    isSaving,
    formError,
    isSaveDisabled,
    setPostVisitNotes,
    setFollowUpIntervalDays,
    setFollowUpInstructions,
    toggleMeasurements,
    handleWeightChange,
    handleWeightBlur,
    handleHeightChange,
    handleCephalicPerimeterChange,
    toggleVaccineSelection,
    handleSave,
  };
}
