"use client";

import { Share2 } from "lucide-react";

export function ReportsExportButton() {
  return (
    <button className="flex items-center gap-2 px-4 py-2.5 glass rounded-full transition-all duration-200 active:scale-95 hover:bg-surface-variant/40">
      <Share2 className="w-4 h-4 text-text-secondary" strokeWidth={1.5} />
      <span className="font-display text-xs text-text-secondary">
        Compartilhar
      </span>
    </button>
  );
}
