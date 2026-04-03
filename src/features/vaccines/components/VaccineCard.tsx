"use client";

import { Check, Lock, MapPin, NotebookPen } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { formatScheduledMonthLabel } from "../constants";
import type { VaccineTimelineItem } from "../types";

interface VaccineCardProps {
  item: VaccineTimelineItem;
  onSelect: (item: VaccineTimelineItem) => void;
}

export function VaccineCard({ item, onSelect }: VaccineCardProps) {
  const isLocked = item.status === "locked";
  const isTaken = item.status === "taken";

  return (
    <button
      type="button"
      onClick={() => {
        if (!isLocked) {
          onSelect(item);
        }
      }}
      disabled={isLocked}
      className={`w-full rounded-3xl border p-5 text-left transition-all duration-200 ${
        isLocked
          ? "border-surface-variant/10 bg-surface-variant/10 opacity-70 cursor-not-allowed"
          : isTaken
            ? "border-[#8EAF96]/25 bg-[#8EAF96]/10 hover:border-[#8EAF96]/35"
            : "border-surface-variant/20 bg-surface-container-low hover:border-primary/25 hover:bg-surface-variant/10"
      }`}
      aria-label={`${item.name} ${item.doseLabel ?? ""}`.trim()}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-lg text-text-primary font-medium">
              {item.name}
            </h3>
            {item.isCustom && (
              <span className="px-2 py-1 rounded-full bg-[#D2B59D]/15 text-[#D2B59D] font-data text-[9px] tracking-widest uppercase">
                Custom
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-2">
            {item.doseLabel && (
              <span className="font-data text-[11px] text-text-secondary uppercase tracking-wider">
                {item.doseLabel}
              </span>
            )}
            <span className="font-data text-[11px] text-text-disabled uppercase tracking-wider">
              {formatScheduledMonthLabel(item.scheduledMonth)}
            </span>
          </div>
        </div>

        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isLocked
              ? "bg-surface-variant/20 text-text-disabled"
              : isTaken
                ? "bg-[#8EAF96]/15 text-[#8EAF96]"
                : "bg-[#D2B59D]/15 text-[#D2B59D]"
          }`}
        >
          {isLocked ? (
            <Lock className="w-5 h-5" strokeWidth={2} />
          ) : isTaken ? (
            <Check className="w-5 h-5" strokeWidth={2.5} />
          ) : (
            <NotebookPen className="w-5 h-5" strokeWidth={2} />
          )}
        </div>
      </div>

      {isTaken ? (
        <div className="mt-4 flex flex-col gap-2">
          <p className="font-data text-sm text-text-primary">
            Tomada em {formatDate(item.appliedDate ?? "")}
          </p>
          {item.appliedLocation && (
            <div className="flex items-center gap-2 text-text-secondary">
              <MapPin className="w-4 h-4" strokeWidth={1.75} />
              <span className="font-data text-xs">{item.appliedLocation}</span>
            </div>
          )}
        </div>
      ) : isLocked ? (
        <p className="font-data text-sm text-text-disabled mt-4">
          Disponivel para edicao apenas quando o bebe atingir este mes.
        </p>
      ) : (
        <p className="font-data text-sm text-text-secondary mt-4">
          Toque para registrar como tomada, incluir local e anotar observacoes.
        </p>
      )}
    </button>
  );
}
