"use client";

import { useSleep } from "@/contexts/SleepContext";

export function SleepBackgroundStaticEffect() {
  const { isActive } = useSleep();

  if (!isActive) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(123,158,135,0.16) 0%, transparent 40%), radial-gradient(circle at 80% 75%, rgba(122,95,58,0.14) 0%, transparent 42%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, transparent 24%, rgba(17, 19, 25, 0.58) 100%)",
        }}
      />
    </div>
  );
}
