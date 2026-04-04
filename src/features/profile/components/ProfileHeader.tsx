"use client";

import { BrandLogo } from "@/components/branding/BrandLogo";
import { useBaby } from "@/contexts/BabyContext";

export function ProfileHeader() {
  const { baby } = useBaby();

  return (
    <header className="px-6 pt-12 pb-4">
      <div className="mb-6 flex items-center">
        <BrandLogo size={40} />
      </div>

      <div className="mb-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Perfil
        </h1>
        <p className="mt-1 font-data text-sm text-text-disabled">
          Gerencie o perfil{baby ? ` do ${baby.name}` : ""} e configurações do app
        </p>
      </div>
    </header>
  );
}
