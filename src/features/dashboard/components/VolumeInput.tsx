"use client";

import { useRef } from "react";

interface VolumeInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function VolumeInput({ value, onChange }: VolumeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdjust(delta: number) {
    onChange(Math.max(0, value + delta));
  }

  function handleDirectInput() {
    inputRef.current?.focus();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    onChange(raw === "" ? 0 : parseInt(raw, 10));
  }

  function handleBlur() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center py-8">
      <div className="relative">
        <button
          onClick={handleDirectInput}
          className="font-data text-6xl text-text-primary tracking-tight tabular-nums cursor-text"
        >
          {value}
          <span className="text-3xl text-text-secondary ml-1">ml</span>
        </button>
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text text-transparent caret-transparent"
          style={{ fontSize: "16px" }}
        />
      </div>

      <span className="font-data text-[10px] text-text-disabled uppercase tracking-widest mt-2 mb-6">
        Toque no valor para digitar
      </span>

      <div className="flex flex-col gap-2 w-full max-w-[240px]">
        <div className="flex gap-2 justify-center">
          <AdjustButton delta={-50} onPress={handleAdjust} />
          <AdjustButton delta={-25} onPress={handleAdjust} />
          <AdjustButton delta={-5} onPress={handleAdjust} />
        </div>
        <div className="flex gap-2 justify-center">
          <AdjustButton delta={5} onPress={handleAdjust} />
          <AdjustButton delta={25} onPress={handleAdjust} />
          <AdjustButton delta={50} onPress={handleAdjust} />
        </div>
      </div>
    </div>
  );
}

function AdjustButton({
  delta,
  onPress,
}: {
  delta: number;
  onPress: (d: number) => void;
}) {
  return (
    <button
      onClick={() => onPress(delta)}
      className={`w-16 h-12 rounded-2xl font-data text-sm font-medium transition-all duration-200 active:scale-95 ${
        delta < 0
          ? "bg-surface-container-highest text-text-secondary hover:bg-surface-variant"
          : "bg-primary/15 text-primary hover:bg-primary/25"
      }`}
    >
      {delta > 0 ? `+${delta}` : delta}
    </button>
  );
}
