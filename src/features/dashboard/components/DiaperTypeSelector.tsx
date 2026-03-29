"use client";

import { Droplet, FileText, Circle } from "lucide-react";
import type { DiaperType } from "../types";

interface DiaperTypeSelectorProps {
  value: DiaperType;
  onChange: (type: DiaperType) => void;
}

const TYPES: { value: DiaperType; label: string }[] = [
  { value: "xixi", label: "Xixi" },
  { value: "coco", label: "Cocô" },
  { value: "ambos", label: "Ambos" },
];

export function DiaperTypeSelector({ value, onChange }: DiaperTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {TYPES.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 gap-3 border ${
            value === t.value
              ? "bg-primary border-primary shadow-lg shadow-primary/20"
              : "bg-surface-variant/5 border-transparent hover:bg-surface-variant/10"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              value === t.value ? "bg-on-primary/10" : "bg-surface-variant/10"
            }`}
          >
            {t.value === "xixi" && (
              <Droplet className={`w-5 h-5 ${value === t.value ? "text-on-primary" : "text-secondary"}`} />
            )}
            {t.value === "coco" && (
              <FileText className={`w-5 h-5 ${value === t.value ? "text-on-primary" : "text-primary"}`} />
            )}
            {t.value === "ambos" && (
              <div className="flex -space-x-1">
                <Circle className={`w-4 h-4 ${value === t.value ? "text-on-primary" : "text-text-secondary"}`} />
                <Circle className={`w-4 h-4 ${value === t.value ? "text-on-primary" : "text-text-secondary"}`} />
              </div>
            )}
          </div>
          <span
            className={`font-display text-[13px] font-medium ${
              value === t.value ? "text-on-primary" : "text-white"
            }`}
          >
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}
