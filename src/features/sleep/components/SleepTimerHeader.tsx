import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function SleepTimerHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 pt-12 pb-6">
      <Link
        href="/dashboard"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container-low text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="h-10 w-10" aria-hidden="true" />
    </header>
  );
}
