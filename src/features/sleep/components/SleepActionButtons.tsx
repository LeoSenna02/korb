"use client";

import { useRouter } from "next/navigation";
import { Sun, Play, Pause, Square, Moon } from "lucide-react";
import { useSleep } from "@/contexts/SleepContext";

function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6;
}

export function SleepActionButtons() {
  const {
    isActive,
    isPaused,
    startSleep,
    endSleep,
    pauseSleep,
    resumeSleep,
    stopSleep,
    errorMessage,
  } = useSleep();
  const router = useRouter();
  const night = isNightTime();

  const handleWakeUp = async () => {
    try {
      await endSleep();
      router.push("/dashboard");
    } catch {
      return;
    }
  };

  if (!isActive) {
    return (
      <div className="flex flex-col gap-4 px-6 mb-8 z-10 relative">
        <button
          onClick={() => startSleep(night ? "night" : "nap")}
          className="w-full h-16 bg-primary hover:bg-primary/90 active:scale-[0.98] text-on-primary font-display font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-primary/10"
        >
          {night ? (
            <>
              <Moon className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-lg">Sono Noturno</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6" strokeWidth={2.5} />
              <span className="text-lg">Iniciar Soneca</span>
            </>
          )}
        </button>

        {errorMessage ? (
          <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 font-data text-xs text-red-100">
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-6 mb-8 z-10 relative">
      <button
        onClick={handleWakeUp}
        className="w-full h-16 bg-primary hover:bg-primary/90 active:scale-[0.98] text-on-primary font-display font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-primary/10"
      >
        <Sun className="w-6 h-6" strokeWidth={2.5} />
        <span className="text-lg">Acordou</span>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={isPaused ? resumeSleep : pauseSleep}
          className="h-14 bg-surface-container-low hover:bg-surface-variant/40 border border-outline-variant/10 text-text-primary font-display font-medium rounded-2xl flex items-center justify-center gap-2 transition-all duration-200"
        >
          {isPaused ? (
            <>
              <Play className="w-[18px] h-[18px] text-primary" />
              <span className="text-[15px]">Retomar</span>
            </>
          ) : (
            <>
              <Pause className="w-[18px] h-[18px] text-text-secondary" />
              <span className="text-[15px]">Pausar</span>
            </>
          )}
        </button>
        <button
          onClick={stopSleep}
          className="h-14 bg-surface-container-low hover:bg-surface-variant/40 border border-outline-variant/10 text-text-primary font-display font-medium rounded-2xl flex items-center justify-center gap-2 transition-all duration-200"
        >
          <Square className="w-[18px] h-[18px] text-text-secondary" />
          <span className="text-[15px]">Parar</span>
        </button>
      </div>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 font-data text-xs text-red-100">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
