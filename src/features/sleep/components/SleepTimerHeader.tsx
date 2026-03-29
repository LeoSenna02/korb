import { ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";

export function SleepTimerHeader() {
  return (
    <header className="flex items-center justify-between px-6 pt-12 pb-6 relative z-10">
      <Link 
        href="/dashboard"
        className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors border border-outline-variant/30"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
      
      <button className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary bg-surface-container-low hover:bg-surface-variant/50 transition-colors border border-outline-variant/30 relative">
        <Bell className="w-5 h-5" />
        <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-surface-container-low" />
      </button>
    </header>
  );
}
