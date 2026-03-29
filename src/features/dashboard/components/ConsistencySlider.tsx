"use client";

import { Droplet, Circle, Minus, type LucideIcon } from "lucide-react";
import type { Consistency } from "../types";

interface ConsistencySliderProps {
  value: Consistency;
  onChange: (consistency: Consistency) => void;
}

const CONSISTENCIES: { value: Consistency; label: string }[] = [
  { value: "liquido", label: "Líquido" },
  { value: "pastoso", label: "Pastoso" },
  { value: "solido", label: "Sólido" },
];

const ICONS: { icon: LucideIcon; label: string }[] = [
  { icon: Droplet, label: "líquido" },
  { icon: Circle, label: "pastoso" },
  { icon: Minus, label: "sólido" },
];

export function ConsistencySlider({ value, onChange }: ConsistencySliderProps) {
  const getPosition = () => {
    if (value === "liquido") return "0%";
    if (value === "pastoso") return "50%";
    return "100%";
  };

  return (
    <div className="px-6 relative py-4">
      <div className="flex justify-between items-end mb-4 px-2">
        {ICONS.map(({ icon: Icon, label }) => (
          <Icon key={label} className="w-5 h-5 text-primary/60" strokeWidth={1.5} />
        ))}
      </div>

      <div className="h-1 bg-surface-variant/30 rounded-full w-full relative">
        <div
          className="absolute top-0 bottom-0 left-0 bg-primary/40 rounded-full"
          style={{ width: getPosition() }}
        />

        <div className="absolute inset-0 flex justify-between px-0 -top-[5px]">
          {CONSISTENCIES.map((c) => (
            <button
              key={c.value}
              onClick={() => onChange(c.value)}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                value === c.value
                  ? "bg-primary border-primary scale-125 shadow-lg shadow-primary/40"
                  : "bg-surface-container-highest border-outline"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-4">
        {CONSISTENCIES.map((c) => (
          <span
            key={c.label}
            className={`font-data text-[10px] tracking-widest uppercase transition-colors ${
              value === c.value ? "text-white font-bold" : "text-text-secondary"
            }`}
          >
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
