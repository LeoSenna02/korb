import type { Metadata } from "next";
import { HistoryHeader } from "@/features/history/components/HistoryHeader";
import { HistoryView } from "@/features/history/components/HistoryView";

export const metadata: Metadata = {
  title: "Histórico — Korb",
  description: "Veja o histórico completo de atividades do seu bebê.",
};

export default function HistoryPage() {
  return (
    <>
      <HistoryHeader />
      <main>
        <HistoryView />
      </main>
    </>
  );
}
