"use client";

import { Moon } from "lucide-react";
import { useSleep } from "@/contexts/SleepContext";
import { formatTime } from "@/lib/utils/format";
import { useLowPerformanceMode } from "@/lib/hooks/useLowPerformanceMode";
import { AnimatedTimeValue } from "@/components/ui";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getSleepPhrase(seconds: number, isNap: boolean): string {
  const minutes = seconds / 60;

  const napPhrases: [number, string][] = [
    [0, "Adormecendo..."],
    [3, "Sono leve"],
    [10, "Dormindo\ntranquilamente"],
    [20, "Sono profundo"],
    [45, "Descansando\nbem"],
    [90, "Sono\nreparador"],
    [150, "Soneca\nlonga"],
  ];

  const nightPhrases: [number, string][] = [
    [0, "Adormecendo..."],
    [5, "Sono leve"],
    [15, "Dormindo\ntranquilamente"],
    [30, "Sono\nprofundo"],
    [60, "Noite serena"],
    [120, "Descansando\nbem"],
    [240, "Sono\nreparador"],
    [360, "Longa noite\nde sono"],
  ];

  const phrases = isNap ? napPhrases : nightPhrases;

  let result = phrases[0][1];
  for (const [threshold, phrase] of phrases) {
    if (minutes >= threshold) {
      result = phrase;
    }
  }

  return result;
}

export function SleepStatusCircle() {
  const { isActive, isPaused, startedAt, sleepType, elapsedSeconds } = useSleep();
  const lowPerformanceMode = useLowPerformanceMode();

  if (!isActive || !startedAt) {
    return (
      <div className="relative flex flex-col items-center justify-center py-8 mb-4 flex-1">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[280px] h-[280px] rounded-full border border-outline-variant/10 absolute" />
          <div className="w-[340px] h-[340px] rounded-full border border-outline-variant/5 absolute" />
        </div>

        <div className="z-10 flex flex-col items-center text-center">
          <span className="font-data text-[10px] text-text-secondary uppercase tracking-[0.2em] mb-4">
            STATUS ATUAL
          </span>
          <h2 className="font-display text-3xl text-text-primary font-medium mb-2 leading-tight">
            Nenhuma soneca<br />em andamento
          </h2>
          <p className="font-data text-sm text-text-disabled mb-10">
            Inicie uma soneca para registrar
          </p>
          <div className="font-display text-[68px] leading-none text-text-disabled mb-8 tracking-tighter font-light">
            00<span className="text-text-disabled/50">:</span>00<span className="text-text-disabled/50">:</span>00
          </div>
        </div>
      </div>
    );
  }

  const isNap = sleepType === "nap";
  const title = getSleepPhrase(elapsedSeconds, isNap);

  return (
    <div className="relative flex flex-col items-center justify-center py-8 mb-4 flex-1">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[280px] h-[280px] rounded-full border border-outline-variant/10 absolute" />
        <div className="w-[340px] h-[340px] rounded-full border border-outline-variant/5 absolute" />
      </div>

      <div className="z-10 flex flex-col items-center text-center">
        <span className="font-data text-[10px] text-text-secondary uppercase tracking-[0.2em] mb-4">
          STATUS ATUAL
        </span>

        <h2 className="font-display text-3xl text-text-primary font-medium mb-2 leading-tight whitespace-pre-line">
          {title}
        </h2>

        <p className="font-data text-sm text-text-disabled mb-10">
          Iniciado às {formatTime(startedAt)}
        </p>

        <div className="font-display text-[68px] leading-none text-text-primary mb-8 tracking-tighter font-light">
          <AnimatedTimeValue
            value={formatElapsed(elapsedSeconds)}
            animated={!lowPerformanceMode}
          />
        </div>

        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/20 px-4 py-2 rounded-full">
          <Moon className="w-4 h-4 text-primary" />
          <span className="font-data text-[11px] text-primary uppercase tracking-widest font-medium">
            {isPaused ? "PAUSADO" : isNap ? "SONECA" : "SONO NOTURNO"}
          </span>
        </div>
      </div>
    </div>
  );
}
