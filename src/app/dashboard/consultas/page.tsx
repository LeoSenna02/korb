import type { Metadata } from "next";
import { ConsultasClient } from "@/features/consultas/components/ConsultasClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Consultas pediatricas - Korb",
    description:
      "Gerencie consultas pediatricas, retornos, notas e o dossie da visita do bebe.",
  };
}

export default function ConsultasPage() {
  return <ConsultasClient />;
}
