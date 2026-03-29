"use client";

import { useState, useEffect } from "react";
import { Bell, Sun, CloudSun, Moon } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  babyAgeTag: string;
}

export function DashboardHeader({ userName, babyAgeTag }: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState("Olá");
  const [GreetingIcon, setGreetingIcon] = useState<React.ElementType>(Sun);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Bom dia");
      setGreetingIcon(() => Sun);
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde");
      setGreetingIcon(() => CloudSun);
    } else {
      setGreeting("Boa noite");
      setGreetingIcon(() => Moon);
    }
  }, []);

  return (
    <header className="px-6 pt-12 pb-6">
      {/* Top Navbar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden border border-outline-variant/30 flex items-center justify-center">
            {/* Placeholder for user avatar */}
            <UserAvatarPlaceholder />
          </div>
          <span className="font-display text-lg font-semibold text-primary">Korb</span>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-primary bg-surface-container-low hover:bg-surface-variant/50 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Greeting Area */}
      <div>
        <h1 className="font-display text-4xl text-text-primary mb-3 flex items-center gap-3 font-semibold tracking-tight">
          {greeting}, {userName} <GreetingIcon className="w-8 h-8 text-[#FFC107] drop-shadow-sm" fill="#FFC107" />
        </h1>
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-container/10 border border-primary/20">
          <span className="font-data text-xs text-primary font-medium tracking-wide">
            {babyAgeTag}
          </span>
        </div>
      </div>
    </header>
  );
}

function UserAvatarPlaceholder() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-text-secondary" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}
