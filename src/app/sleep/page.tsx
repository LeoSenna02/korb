import type { Metadata } from "next";
import { SleepPageContent } from "@/features/sleep/components/SleepPageContent";

export const metadata: Metadata = {
  title: "Sono — Korb",
  description: "Acompanhe sonecas e sono noturno do seu bebê.",
};

export default function SleepTimerPage() {
  return <SleepPageContent />;
}
