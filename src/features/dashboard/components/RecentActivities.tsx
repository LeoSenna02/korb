"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Baby, Ruler, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useBaby } from "@/contexts/BabyContext";
import { getRecentActivities } from "@/lib/db/repositories/activity";
import type { ActivityRecord } from "@/lib/db/types";
import { timeAgo } from "@/lib/utils/format";

interface DisplayActivity {
  id: string;
  type: "fralda" | "mamada" | "crescimento" | "consulta";
  title: string;
  details: string;
  timeAgo: string;
  rawDate: string;
}

const iconsMap: Record<DisplayActivity["type"], React.ElementType> = {
  fralda: Droplet,
  mamada: Baby,
  crescimento: Ruler,
  consulta: Stethoscope,
};

const iconColorMap: Record<DisplayActivity["type"], string> = {
  fralda: "text-[#D2B59D]",
  mamada: "text-[#8EAF96]",
  crescimento: "text-text-primary",
  consulta: "text-[#88AFC7]",
};

function formatActivity(record: ActivityRecord): DisplayActivity {
  switch (record.activityType) {
    case "diaper": {
      const typeLabel = record.type === "xixi" ? "Xixi" : record.type === "coco" ? "Coco" : "Xixi + Coco";
      return {
        id: record.id,
        type: "fralda",
        title: "Troca de fralda",
        details: `${typeLabel} • ${record.consistency}`,
        timeAgo: timeAgo(record.changedAt),
        rawDate: record.changedAt,
      };
    }
    case "feeding": {
      let details = "";
      if (record.type === "left") details = "Seio esquerdo";
      else if (record.type === "right") details = "Seio direito";
      else if (record.type === "both" && record.leftSeconds !== undefined && record.rightSeconds !== undefined) {
        const minL = Math.floor(record.leftSeconds / 60);
        const minR = Math.floor(record.rightSeconds / 60);
        details = `E:${minL}m | D:${minR}m`;
      } else if (record.type === "bottle") {
        details = record.volumeMl ? `${record.volumeMl}ml` : "Mamadeira";
      }

      if (record.type !== "both" && record.type !== "bottle" && record.durationSeconds) {
        details += ` • ${Math.floor(record.durationSeconds / 60)}min`;
      }

      return {
        id: record.id,
        type: "mamada",
        title: "Mamada",
        details: details,
        timeAgo: timeAgo(record.startedAt),
        rawDate: record.startedAt,
      };
    }
    case "growth": {
      const parts: string[] = [];
      if (record.weightKg) parts.push(`${record.weightKg} kg`);
      if (record.heightCm) parts.push(`${record.heightCm} cm`);
      return {
        id: record.id,
        type: "crescimento",
        title: "Medição",
        details: parts.join(" • "),
        timeAgo: timeAgo(record.measuredAt),
        rawDate: record.measuredAt,
      };
    }
    case "appointment": {
      return {
        id: record.id,
        type: "consulta",
        title: "Consulta pediatrica",
        details: record.doctorName,
        timeAgo: timeAgo(record.attendedAt ?? record.scheduledAt),
        rawDate: record.attendedAt ?? record.scheduledAt,
      };
    }
    default: {
      return {
        id: record.id,
        type: "mamada" as const,
        title: "Atividade",
        details: "",
        timeAgo: "",
        rawDate: "",
      };
    }
  }
}

const EMPTY_ACTIVITIES: DisplayActivity[] = [
  {
    id: "empty-1",
    type: "mamada",
    title: "Nenhuma atividade ainda",
    details: "Registre a primeira mamada, fralda ou medição",
    timeAgo: "",
    rawDate: "",
  },
];

interface RecentActivitiesProps {
  refreshKey?: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: 12 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export function RecentActivities({ refreshKey }: RecentActivitiesProps) {
  const { baby } = useBaby();
  const [activities, setActivities] = useState<DisplayActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadActivities = useCallback(async () => {
    if (!baby) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    try {
      const records = await getRecentActivities(baby.id, 5);
      if (records.length === 0) {
        setActivities(EMPTY_ACTIVITIES);
      } else {
        setActivities(records.map(formatActivity));
      }
    } catch (err) {
      console.error("[RecentActivities] Load error:", err);
      setActivities(EMPTY_ACTIVITIES);
    } finally {
      setIsLoading(false);
    }
  }, [baby]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities, refreshKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivities((prev) =>
        prev.map((a) =>
          a.rawDate ? { ...a, timeAgo: timeAgo(a.rawDate) } : a
        )
      );
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl text-text-primary font-medium tracking-tight">
          Últimas Atividades
        </h2>
        <Link href="/dashboard/history" className="font-data text-[10px] text-text-secondary uppercase tracking-widest hover:text-text-primary transition-colors">
          Ver Tudo
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-surface-container border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => {
              const Icon = iconsMap[activity.type];
              return (
                <motion.div
                  key={activity.id}
                  variants={item}
                  layout
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-surface-variant/20"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center ${iconColorMap[activity.type]}`}>
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-display text-[15px] font-medium text-text-primary leading-tight mb-1">
                        {activity.title}
                      </span>
                      <span className="font-data text-[12px] text-text-secondary leading-none">
                        {activity.details}
                      </span>
                    </div>
                  </div>

                  {activity.timeAgo && (
                    <span className="font-data text-[11px] text-text-disabled tracking-wide">
                      {activity.timeAgo}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
