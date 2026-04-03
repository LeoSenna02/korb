"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Lock, MapPin, Trash2, XCircle } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import {
  clearVaccineApplication,
  deleteVaccine,
  saveVaccine,
  updateVaccine,
} from "@/lib/db/repositories/vaccine";
import { formatScheduledMonthLabel } from "../constants";
import type { VaccineSheetMode, VaccineTimelineItem } from "../types";

interface VaccineSheetProps {
  babyId: string;
  isOpen: boolean;
  mode: VaccineSheetMode;
  item?: VaccineTimelineItem;
  onClose: () => void;
  onSaved: () => void;
}

function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function VaccineSheet({
  babyId,
  isOpen,
  mode,
  item,
  onClose,
  onSaved,
}: VaccineSheetProps) {
  const [name, setName] = useState("");
  const [scheduledMonth, setScheduledMonth] = useState("0");
  const [isTaken, setIsTaken] = useState(false);
  const [appliedDate, setAppliedDate] = useState(getTodayLocalDate());
  const [appliedLocation, setAppliedLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOfficial = mode === "official-record";
  const isCustomEdit = mode === "custom-edit";
  const today = useMemo(() => getTodayLocalDate(), []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(item?.name ?? "");
    setScheduledMonth(String(item?.scheduledMonth ?? 0));
    setIsTaken(Boolean(item?.appliedDate));
    setAppliedDate(item?.appliedDate ?? today);
    setAppliedLocation(item?.appliedLocation ?? "");
    setNotes(item?.notes ?? "");
  }, [isOpen, item, today]);

  const title =
    mode === "custom-create"
      ? "Adicionar vacina"
      : item?.name ?? "Registro de vacina";
  const subtitle =
    mode === "official-record"
      ? "Atualize apenas o status de aplicacao desta vacina oficial."
      : mode === "custom-edit"
        ? "Edite os dados desta vacina customizada."
        : "Crie uma vacina customizada para a linha do tempo do bebe.";

  async function handleSave() {
    const trimmedName = name.trim();
    const parsedMonth = Number(scheduledMonth);

    if (!isOfficial && (!trimmedName || Number.isNaN(parsedMonth))) {
      return;
    }

    if (!isOfficial && (parsedMonth < 0 || parsedMonth > 24)) {
      return;
    }

    setIsSaving(true);

    try {
      if (isOfficial && item) {
        const payload = {
          appliedDate: isTaken ? appliedDate : undefined,
          appliedLocation: isTaken ? appliedLocation.trim() || undefined : undefined,
          notes: isTaken ? notes.trim() || undefined : undefined,
        };

        if (item.recordId) {
          await updateVaccine(item.recordId, payload);
        } else if (isTaken) {
          await saveVaccine({
            id: crypto.randomUUID(),
            babyId,
            vaccineId: item.vaccineId,
            name: item.name,
            doseLabel: item.doseLabel,
            scheduledMonth: item.scheduledMonth,
            appliedDate: payload.appliedDate,
            appliedLocation: payload.appliedLocation,
            notes: payload.notes,
            isCustom: false,
          });
        }
      }

      if (mode === "custom-create") {
        await saveVaccine({
          id: crypto.randomUUID(),
          babyId,
          vaccineId: `custom-${Date.now()}`,
          name: trimmedName,
          doseLabel: undefined,
          scheduledMonth: parsedMonth,
          appliedDate: isTaken ? appliedDate : undefined,
          appliedLocation: isTaken ? appliedLocation.trim() || undefined : undefined,
          notes: isTaken ? notes.trim() || undefined : undefined,
          isCustom: true,
        });
      }

      if (isCustomEdit && item?.recordId) {
        await updateVaccine(item.recordId, {
          name: trimmedName,
          scheduledMonth: parsedMonth,
          appliedDate: isTaken ? appliedDate : undefined,
          appliedLocation: isTaken ? appliedLocation.trim() || undefined : undefined,
          notes: isTaken ? notes.trim() || undefined : undefined,
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("[VaccineSheet] Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClearApplication() {
    if (!item?.recordId) {
      return;
    }

    setIsClearing(true);

    try {
      await clearVaccineApplication(item.recordId);
      onSaved();
      onClose();
    } catch (error) {
      console.error("[VaccineSheet] Clear error:", error);
    } finally {
      setIsClearing(false);
    }
  }

  async function handleDelete() {
    if (!item?.recordId) {
      return;
    }

    if (!confirm("Deseja excluir esta vacina customizada?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteVaccine(item.recordId);
      onSaved();
      onClose();
    } catch (error) {
      console.error("[VaccineSheet] Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
    >
      <div className="space-y-6 pb-6">
        {isOfficial ? (
          <div className="rounded-3xl border border-surface-variant/20 bg-surface-container-low p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg text-text-primary font-medium">
                  {item?.name}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item?.doseLabel && (
                    <span className="font-data text-[11px] uppercase tracking-wider text-text-secondary">
                      {item.doseLabel}
                    </span>
                  )}
                  <span className="font-data text-[11px] uppercase tracking-wider text-text-disabled">
                    {formatScheduledMonthLabel(item?.scheduledMonth ?? 0)}
                  </span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-surface-variant/20 text-text-disabled flex items-center justify-center">
                <Lock className="w-5 h-5" strokeWidth={2} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <Input
              label="Nome da vacina"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Meningite especial"
            />

            <Input
              label="Mes-alvo"
              type="number"
              min={0}
              max={24}
              value={scheduledMonth}
              onChange={(event) => setScheduledMonth(event.target.value)}
              placeholder="0 a 24"
            />
          </>
        )}

        <div className="space-y-3">
          <span className="font-data text-xs text-text-secondary uppercase tracking-wider">
            Status
          </span>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setIsTaken(true);
                setAppliedDate((current) => current || today);
              }}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                isTaken
                  ? "border-[#8EAF96]/40 bg-[#8EAF96]/10"
                  : "border-surface-variant/20 bg-surface-container-low"
              }`}
            >
              <span className="flex items-center gap-2 font-display text-sm text-text-primary">
                <Check className="w-4 h-4 text-[#8EAF96]" strokeWidth={2.25} />
                Tomada
              </span>
              <p className="font-data text-xs text-text-secondary mt-2">
                Permite registrar data, local e observacoes.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIsTaken(false)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                !isTaken
                  ? "border-[#D2B59D]/40 bg-[#D2B59D]/10"
                  : "border-surface-variant/20 bg-surface-container-low"
              }`}
            >
              <span className="flex items-center gap-2 font-display text-sm text-text-primary">
                <XCircle className="w-4 h-4 text-[#D2B59D]" strokeWidth={2.25} />
                Pendente
              </span>
              <p className="font-data text-xs text-text-secondary mt-2">
                Mantem a vacina planejada, sem registro de aplicacao.
              </p>
            </button>
          </div>
        </div>

        {isTaken && (
          <>
            <DateInput
              key={`${mode}-${item?.id ?? "new"}-${appliedDate}`}
              label="Data da aplicacao"
              initialValue={appliedDate}
              onChange={setAppliedDate}
              maxDate={today}
            />

            <div className="space-y-4 rounded-3xl border border-surface-variant/20 bg-surface-container-low p-5">
              <Input
                label="Local"
                value={appliedLocation}
                onChange={(event) => setAppliedLocation(event.target.value)}
                placeholder="Ex: UBS do bairro"
              />

              <div className="flex flex-col gap-2">
                <label className="font-data text-xs text-text-secondary uppercase tracking-wider">
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Observacoes sobre a aplicacao"
                  rows={4}
                  className="w-full rounded-2xl bg-surface-container px-4 py-3 text-text-primary font-data text-sm placeholder:text-text-placeholder resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-14 bg-primary hover:bg-primary/90 active:scale-[0.98] text-on-primary font-display font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            {isSaving ? "Salvando..." : "Salvar"}
          </button>

          {item?.recordId && item.appliedDate && (
            <button
              type="button"
              onClick={handleClearApplication}
              disabled={isClearing || isDeleting}
              className="w-full h-12 rounded-2xl bg-surface-variant/20 text-text-primary font-display font-medium transition-colors hover:bg-surface-variant/35 disabled:opacity-50"
            >
              {isClearing ? "Limpando..." : "Limpar marcacao de tomado"}
            </button>
          )}

          {isCustomEdit && item?.recordId && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
              className="w-full h-12 rounded-2xl bg-tertiary-container/20 text-tertiary-container font-display font-medium transition-colors hover:bg-tertiary-container/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Excluindo..." : "Excluir vacina customizada"}
            </button>
          )}

          {isTaken && (
            <div className="flex items-center gap-2 text-text-secondary">
              <MapPin className="w-4 h-4" strokeWidth={1.8} />
              <span className="font-data text-xs">
                Data, local e notas sao opcionais, mas ajudam a manter o historico organizado.
              </span>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
