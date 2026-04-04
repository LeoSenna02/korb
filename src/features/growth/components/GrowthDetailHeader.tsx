"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { BrandLogo } from "@/components/branding/BrandLogo";
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

        <BrandLogo size={40} />

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
