import { Baby } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticação — Korb",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-dim flex flex-col relative overflow-hidden">
      {/* ─── Atmospheric Glow Background ─── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Primary glow - bottom left */}
        <div
          className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "var(--primary)" }}
        />
        {/* Secondary glow - top right */}
        <div
          className="absolute -top-24 -right-24 w-[360px] h-[360px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "var(--secondary)" }}
        />
      </div>

      {/* ─── App Icon Header ─── */}
      <header className="relative z-10 flex justify-center pt-12 pb-8">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
          <Baby className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
      </header>

      {/* ─── Content ─── */}
      <div className="relative z-10 flex-1 flex flex-col px-6 pb-10">
        {children}
      </div>
    </div>
  );
}
