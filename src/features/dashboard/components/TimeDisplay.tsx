"use client";

interface TimeDisplayProps {
  time: string;
}

export function TimeDisplay({ time }: TimeDisplayProps) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-center gap-3 border border-white/5">
      <div className="text-[#8EAF96]">
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <span className="font-display text-2xl text-white font-medium">{time}</span>
    </div>
  );
}
