"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface GenderSelectorProps {
  label: string;
  name?: string;
  value?: "girl" | "boy";
  onChange?: (value: "girl" | "boy") => void;
  error?: string;
  required?: boolean;
}

const options = [
  { value: "girl" as const, label: "Menina", icon: "♀" },
  { value: "boy" as const, label: "Menino", icon: "♂" },
];

export function GenderSelector({
  label,
  name,
  value,
  onChange,
  error,
  required
}: GenderSelectorProps) {
  const [internalValue, setInternalValue] = useState<"girl" | "boy" | undefined>(value);

  const handleSelect = (val: "girl" | "boy") => {
    setInternalValue(val);
    onChange?.(val);
  };

  const activeValue = value ?? internalValue;

  return (
    <div className="flex flex-col gap-2">
      <span className="font-data text-xs text-text-secondary uppercase tracking-wider">
        {label} {required && "*"}
      </span>
      <div className="flex gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={`
              flex-1 h-12
              rounded-xl
              font-display text-sm font-medium
              flex items-center justify-center gap-2
              transition-all duration-200
              ${
                activeValue === option.value
                  ? "bg-[#8EAF96] text-[#1E2024]"
                  : "bg-surface-container text-text-secondary hover:bg-surface-container-high"
              }
            `}
          >
            <User className="w-4 h-4" strokeWidth={1.5} />
            {option.label}
          </button>
        ))}
      </div>
      
      {name && <input type="hidden" name={name} value={activeValue || ""} />}

      {error && (
        <span className="font-data text-xs text-error mt-1">
          {error}
        </span>
      )}
    </div>
  );
}
