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
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "var(--primary)" }}
        />
        <div
          className="absolute -top-24 -right-24 w-[360px] h-[360px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "var(--secondary)" }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 pb-10 pt-12">
        {children}
      </div>
    </div>
  );
}
