"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Baby, Droplet, Moon, Ruler, Syringe } from "lucide-react";
import { DiaperRegistrySheet } from "./DiaperRegistrySheet";
import { FeedingRegistrySheet } from "./FeedingRegistrySheet";
import { GrowthRegistrySheet } from "./GrowthRegistrySheet";
import { useRouter } from "next/navigation";

interface QuickActionsGridProps {
  onSaved?: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.94, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export function QuickActionsGrid({ onSaved }: QuickActionsGridProps) {
  const [isDiaperSheetOpen, setIsDiaperSheetOpen] = useState(false);
  const [isFeedingSheetOpen, setIsFeedingSheetOpen] = useState(false);
  const [isGrowthSheetOpen, setIsGrowthSheetOpen] = useState(false);
  const router = useRouter();

  const actions = [
    {
      title: "Mamada",
      subtitle: "REGISTRAR",
      icon: Baby,
      color: "bg-[#8EAF96]/10 text-[#8EAF96]",
      onClick: () => setIsFeedingSheetOpen(true),
    },
    {
      title: "Fralda",
      subtitle: "TROCAR",
      icon: Droplet,
      color: "bg-[#D2B59D]/10 text-[#D2B59D]",
      onClick: () => setIsDiaperSheetOpen(true),
    },
    {
      title: "Sono",
      subtitle: "TIMER",
      icon: Moon,
      color: "bg-[#B48EAD]/10 text-[#B48EAD]",
      onClick: () => router.push("/sleep"),
    },
    {
      title: "Crescimento",
      subtitle: "MEDIR",
      icon: Ruler,
      color: "bg-surface-variant text-text-primary",
      onClick: () => setIsGrowthSheetOpen(true),
    },
    {
      title: "Vacinas",
      subtitle: "CALENDARIO",
      icon: Syringe,
      color: "bg-[#88AFC7]/10 text-[#88AFC7]",
      onClick: () => router.push("/vaccines"),
    },
  ];

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 mb-10"
      >
        {actions.map((action) => {
          const Icon = action.icon;
          const isFullWidth = action.title === "Vacinas";
          return (
            <motion.button
              key={action.title}
              variants={item}
              onClick={action.onClick}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-col items-start p-5 bg-surface-container-low rounded-3xl border border-surface-variant/30 hover:bg-surface-variant/20 transition-colors duration-200 text-left${isFullWidth ? " col-span-2" : ""}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${action.color}`}>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="font-display text-base text-text-primary mb-1 font-medium">
                {action.title}
              </h3>
              <span className="font-data text-[10px] text-text-secondary tracking-widest uppercase">
                {action.subtitle}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      <DiaperRegistrySheet
        isOpen={isDiaperSheetOpen}
        onClose={() => setIsDiaperSheetOpen(false)}
        onSaved={onSaved}
      />

      <FeedingRegistrySheet
        isOpen={isFeedingSheetOpen}
        onClose={() => setIsFeedingSheetOpen(false)}
        onSaved={onSaved}
      />

      <GrowthRegistrySheet
        isOpen={isGrowthSheetOpen}
        onClose={() => setIsGrowthSheetOpen(false)}
        onSaved={onSaved}
      />
    </>
  );
}
