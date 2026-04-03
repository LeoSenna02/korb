import type { Metadata } from "next";
import { GrowthClientWrapper } from "@/features/growth/components/GrowthClientWrapper";

export const metadata: Metadata = {
  title: "Crescimento — Korb",
  description: "Acompanhe a evolução de peso, altura e perímetro cefálico do seu bebê.",
};

export default function GrowthPage() {
  return <GrowthClientWrapper />;
}
