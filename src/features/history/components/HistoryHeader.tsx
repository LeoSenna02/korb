import { Bell } from "lucide-react";

export function HistoryHeader() {
  return (
    <header className="px-6 pt-12 pb-4">
      <div className="flex items-center justify-between mb-6">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden border border-outline-variant/30 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 text-text-secondary"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <span className="font-display text-lg font-semibold text-primary">
            Korb
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-primary bg-surface-container-low hover:bg-surface-variant/40 btn-glow-ghost transition-all active:scale-95 border border-surface-variant/20">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="mb-2">
        <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight">
          Histórico
        </h1>
        <p className="font-data text-sm text-text-disabled mt-1">
          Todas as atividades registradas
        </p>
      </div>
    </header>
  );
}
