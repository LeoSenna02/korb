import { LoaderCircle } from "lucide-react";
import type { VaccineRecord } from "@/features/vaccines/types";

interface AttendVaccinesSectionProps {
  vaccineRecords: VaccineRecord[];
  linkedVaccineIds: string[];
  isLoading: boolean;
  onToggleVaccine: (vaccineId: string) => void;
}

function VaccineSuggestionItem({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
        checked
          ? "border-[#8EAF96]/30 bg-[#8EAF96]/10"
          : "border-surface-variant/20 bg-surface-container-high"
      }`}
    >
      <span className="font-data text-sm text-text-primary">{label}</span>
    </button>
  );
}

export function AttendVaccinesSection({
  vaccineRecords,
  linkedVaccineIds,
  isLoading,
  onToggleVaccine,
}: AttendVaccinesSectionProps) {
  return (
    <div className="space-y-2">
      <p className="font-data text-[10px] uppercase tracking-[0.18em] text-text-secondary">
        Vacinas aplicadas
      </p>

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-2xl bg-surface-container-high p-4 text-text-secondary">
          <LoaderCircle className="w-4 h-4 animate-spin" />
          <span className="font-data text-sm">Buscando vacinas do mesmo dia...</span>
        </div>
      ) : null}

      {!isLoading && vaccineRecords.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-high p-4">
          <span className="font-data text-sm text-text-disabled">
            Nenhuma vacina aplicada encontrada nessa data.
          </span>
        </div>
      ) : null}

      {!isLoading && vaccineRecords.length > 0 ? (
        <div className="grid gap-2">
          {vaccineRecords.map((record) => (
            <VaccineSuggestionItem
              key={record.id}
              label={`${record.name}${record.doseLabel ? ` - ${record.doseLabel}` : ""}`}
              checked={linkedVaccineIds.includes(record.id)}
              onToggle={() => onToggleVaccine(record.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
