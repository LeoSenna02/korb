import type { Metadata } from "next";
import { ReportsHeader } from "@/features/reports/components/ReportsHeader";
import { ReportsClientWrapper } from "@/features/reports/components/ReportsClientWrapper";

export const metadata: Metadata = {
  title: "Relatórios — Korb",
  description: "Análise completa da rotina e desenvolvimento do seu bebê.",
};

export default function ReportsPage() {
  return (
    <>
      <ReportsHeader />
      <main className="px-6 pb-36 space-y-6">
        <ReportsClientWrapper />
      </main>
    </>
  );
}
