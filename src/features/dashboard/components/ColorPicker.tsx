"use client";

import type { DiaperColor } from "../types";

interface ColorPickerProps {
  value: DiaperColor;
  onChange: (color: DiaperColor) => void;
}

const COLORS: DiaperColor[] = ["#8B4513", "#DAA520", "#556B2F"];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-4 items-center h-[60px]">
      {COLORS.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`w-10 h-10 rounded-full transition-all duration-300 ring-offset-4 ring-offset-surface-container ${
            value === c ? "ring-2 ring-primary scale-110" : "opacity-60"
          }`}
          style={{ backgroundColor: c }}
          aria-label={`Cor ${c}`}
        />
      ))}
    </div>
  );
}
