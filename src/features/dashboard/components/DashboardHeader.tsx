"use client";

import { Sun, CloudSun, Moon } from "lucide-react";
import { BrandLogo } from "@/components/branding/BrandLogo";

interface DashboardHeaderProps {
  userName: string;
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

export function DashboardHeader({ userName }: DashboardHeaderProps) {
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
      </div>
    </header>
  );
}
