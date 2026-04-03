"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useBaby } from "@/contexts/BabyContext";
import { calculateBabyAge } from "@/lib/utils/format";

interface GrowthDetailHeaderProps {
  onCreate: () => void;
}

export function GrowthDetailHeader({ onCreate }: GrowthDetailHeaderProps) {
  const { baby } = useBaby();
  const router = useRouter();
  const age = baby ? calculateBabyAge(baby.birthDate) : "";

  return (
    <header className="px-6 pt-12 pb-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary bg-surface-container-low hover:bg-surface-variant/50 transition-colors border border-surface-variant/20"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden border border-outline-variant/30 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 text-text-secondary"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <span className="font-display text-lg font-semibold text-primary">
            Korb
          </span>
        </div>

        <button
          onClick={onCreate}
          className="w-10 h-10 rounded-full flex items-center justify-center text-primary bg-surface-container-low hover:bg-surface-variant/50 transition-colors border border-surface-variant/20"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-2">
        <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight">
          Crescimento
        </h1>
        <p className="font-data text-sm text-text-disabled mt-1">
          {baby ? `Acompanhamento do ${baby.name}` : "Acompanhamento de crescimento"}
          {age && <span className="text-text-secondary"> &middot; {age}</span>}
        </p>
      </div>
    </header>
  );
}
