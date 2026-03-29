"use client";

import { useState } from "react";
import type { BloodType } from "@/lib/db/types";

interface BloodTypeSelectorProps {
  label: string;
  name?: string;
  value?: BloodType;
  onChange?: (value: BloodType) => void;
  error?: string;
}

const BLOOD_TYPES: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function BloodTypeSelector({
  label,
  name,
  value,
  onChange,
  error,
}: BloodTypeSelectorProps) {
  const [internalValue, setInternalValue] = useState<BloodType | undefined>(value);

  const handleSelect = (val: BloodType) => {
    setInternalValue(val);
    onChange?.(val);
  };

  const activeValue = value ?? internalValue;

  return (
    <div className="flex flex-col gap-2">
      <span className="font-data text-xs text-text-secondary uppercase tracking-wider">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {BLOOD_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleSelect(type)}
            className={`
              min-w-[52px] h-10 px-3
              rounded-xl
              font-data text-sm font-medium
              flex items-center justify-center
              transition-all duration-200
              ${
                activeValue === type
                  ? "bg-[#8EAF96] text-[#1E2024]"
                  : "bg-surface-container text-text-secondary hover:bg-surface-container-high"
              }
            `}
          >
            {type}
          </button>
        ))}
      </div>

      {name && <input type="hidden" name={name} value={activeValue || ""} />}

      {error && (
        <span className="font-data text-xs text-[#CD8282] mt-1">
          {error}
        </span>
      )}
    </div>
  );
}
