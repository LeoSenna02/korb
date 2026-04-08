import type { Metadata } from "next";
import { SymptomsClient } from "@/features/symptoms/components/SymptomsClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sintomas - Korb",
    description:
      "Acompanhe episodios de sintomas do bebe com historico, notas e integracao com consultas.",
  };
}

export default function SymptomsPage() {
  return <SymptomsClient />;
}
