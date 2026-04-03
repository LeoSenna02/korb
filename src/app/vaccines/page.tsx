import type { Metadata } from "next";
import { VaccinesClient } from "@/features/vaccines/components/VaccinesClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Vacinas — Korb",
    description:
      "Gerencie o calendario de vacinas do bebe com base no nascimento e nas doses padrao do SUS.",
  };
}

export default function VaccinesPage() {
  return <VaccinesClient />;
}
