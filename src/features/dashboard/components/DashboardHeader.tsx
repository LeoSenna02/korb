"use client";

import { Sun, CloudSun, Moon } from "lucide-react";
import { BrandLogo } from "@/components/branding/BrandLogo";

interface DashboardHeaderProps {
  userName: string;
  babyAgeTag: string;
}

function getGreetingState() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: "Bom dia",
      GreetingIcon: Sun,
    };
  }

  if (hour >= 12 && hour < 18) {
    return {
      greeting: "Boa tarde",
      GreetingIcon: CloudSun,
    };
  }

  return {
    greeting: "Boa noite",
    GreetingIcon: Moon,
  };
}

export function DashboardHeader({ userName, babyAgeTag }: DashboardHeaderProps) {
  const { greeting, GreetingIcon } = getGreetingState();

  return (
    <header className="px-6 pt-12 pb-6">
      <div className="mb-8 flex items-center">
        <BrandLogo size={40} />
      </div>

      <div>
        <h1 className="mb-3 flex items-center gap-3 font-display text-4xl font-semibold tracking-tight text-text-primary">
          {greeting}, {userName}{" "}
          <GreetingIcon className="w-8 h-8 text-[#FFC107] drop-shadow-sm" fill="#FFC107" />
        </h1>
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary-container/10 px-4 py-1.5">
          <span className="font-data text-xs font-medium tracking-wide text-primary">
            {babyAgeTag}
          </span>
        </div>
      </div>
    </header>
  );
}
