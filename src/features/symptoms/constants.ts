import type { SymptomSeverity } from "@/lib/db/types";
import type { SymptomOption, SymptomSeverityMeta } from "./types";

export const SYMPTOM_PRESET_OPTIONS: SymptomOption[] = [
  { id: "febre", label: "Febre" },
  { id: "tosse", label: "Tosse" },
  { id: "coriza", label: "Coriza" },
  { id: "resfriado", label: "Resfriado" },
  { id: "vomito", label: "Vomito" },
  { id: "diarreia", label: "Diarreia" },
];

const SYMPTOM_LABEL_BY_ID = Object.fromEntries(
  SYMPTOM_PRESET_OPTIONS.map((option) => [option.id, option.label])
) as Record<string, string>;

export const SYMPTOM_SEVERITY_META: Record<
  SymptomSeverity,
  SymptomSeverityMeta
> = {
  leve: {
    label: "Leve",
    description: "Acompanhamento tranquilo",
    accentClassName: "text-[#8EAF96]",
    surfaceClassName: "bg-[#8EAF96]/10",
  },
  moderada: {
    label: "Moderada",
    description: "Pede mais observacao",
    accentClassName: "text-[#D2B59D]",
    surfaceClassName: "bg-[#D2B59D]/10",
  },
  alta: {
    label: "Alta",
    description: "Sinal de maior atencao",
    accentClassName: "text-[#CD8282]",
    surfaceClassName: "bg-[#CD8282]/10",
  },
};

export const DEFAULT_SYMPTOM_SEVERITY: SymptomSeverity = "leve";

export function getSymptomLabel(value: string): string {
  return SYMPTOM_LABEL_BY_ID[value.trim().toLowerCase()] ?? value;
}

export function getSymptomOptionId(value: string): string | null {
  const normalizedValue = value.trim().toLowerCase();
  const matchedOption = SYMPTOM_PRESET_OPTIONS.find(
    (option) =>
      option.id === normalizedValue || option.label.toLowerCase() === normalizedValue
  );

  return matchedOption?.id ?? null;
}
