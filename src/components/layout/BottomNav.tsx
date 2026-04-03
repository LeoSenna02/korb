"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, BarChart2, User } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";

export function BottomNav() {
  const pathname = usePathname();
  const { activeModals } = useModal();

  if (activeModals > 0) {
    return null;
  }

  const navItems = [
    { name: "Início", path: "/dashboard", icon: Home },
    { name: "Histórico", path: "/dashboard/history", icon: History },
    { name: "Relatórios", path: "/dashboard/reports", icon: BarChart2 },
    { name: "Perfil", path: "/dashboard/profile", icon: User },
  ];

  return (
    <nav
      className="fixed left-4 right-4 min-h-24 bg-surface-container-low/90 backdrop-blur-xl border border-surface-variant/20 flex justify-around items-center px-4 pt-3 z-50 rounded-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.1)]"
      style={{
        bottom: "max(0.75rem, env(safe-area-inset-bottom))",
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.path}
            className="flex flex-col items-center justify-center w-20 h-full gap-1.5 transition-all duration-300 relative group"
          >
            <div className={`
              flex items-center justify-center w-14 h-14 rounded-[22px] transition-all duration-300
              ${isActive ? "bg-[#8EAF96]/20 text-[#8EAF96]" : "text-text-disabled group-hover:bg-surface-variant/30"}
            `}>
              <Icon 
                className={`w-6 h-6 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
            </div>
            <span className={`
              font-display text-[9px] tracking-[0.15em] font-bold uppercase transition-colors duration-300
              ${isActive ? "text-[#8EAF96]" : "text-text-disabled"}
            `}>
              {item.name}
            </span>
            {isActive && (
              <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#8EAF96]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
