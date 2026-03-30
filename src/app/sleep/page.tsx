import { SleepTimerHeader } from "@/features/sleep/components/SleepTimerHeader";
import { SleepStatusCircle } from "@/features/sleep/components/SleepStatusCircle";
import { SleepActionButtons } from "@/features/sleep/components/SleepActionButtons";
import { SleepGoalCard } from "@/features/sleep/components/SleepGoalCard";
import { SleepBackgroundWrapper } from "@/features/sleep/components/SleepBackgroundWrapper";

export default function SleepTimerPage() {
  return (
    <main className="min-h-screen bg-surface-dim flex flex-col relative overflow-hidden font-sans">
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute w-[150%] aspect-square rounded-full border border-white/[0.02]" />
        <div className="absolute w-[120%] aspect-square rounded-full border border-white/[0.03]" />
        <div className="absolute w-[90%] aspect-square rounded-full border border-white/[0.04]" />
        <div className="absolute w-[60%] aspect-square rounded-full border border-white/[0.05]" />

        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,158,135,0.05)_0%,transparent_70%)]" />
      </div>

      {/* Active sleep effect */}
      <SleepBackgroundWrapper />

      <SleepTimerHeader />

      <div className="flex-1 flex flex-col justify-between relative z-10">
        <SleepStatusCircle />

        <div className="mt-auto">
          <SleepActionButtons />
          <SleepGoalCard />
        </div>
      </div>
    </main>
  );
}
