import { Ruler } from "lucide-react";
import { MeasurementInputField } from "./MeasurementInputField";

interface AttendMeasurementsSectionProps {
  enabled: boolean;
  weight: string;
  height: string;
  cephalicPerimeter: string;
  error?: string | null;
  onToggle: () => void;
  onWeightChange: (value: string) => void;
  onWeightBlur: () => void;
  onHeightChange: (value: string) => void;
  onCephalicPerimeterChange: (value: string) => void;
}

export function AttendMeasurementsSection({
  enabled,
  weight,
  height,
  cephalicPerimeter,
  error,
  onToggle,
  onWeightChange,
  onWeightBlur,
  onHeightChange,
  onCephalicPerimeterChange,
}: AttendMeasurementsSectionProps) {
  return (
    <div className="rounded-2xl border border-surface-variant/20 bg-surface-container-high px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#88AFC7]">
            <Ruler className="w-4 h-4" strokeWidth={1.8} />
            <p className="font-display text-base text-text-primary">Medidas</p>
          </div>
          <p className="mt-2 font-data text-sm leading-relaxed text-text-secondary">
            Ative para registrar peso, altura e cefalia nesta visita. Ao salvar,
            isso tambem entra na tela de Crescimento.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={onToggle}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-surface-variant"
          }`}
          aria-label="Ativar medidas"
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
              enabled ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {enabled ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MeasurementInputField
            label="PESO"
            unit="kg"
            value={weight}
            placeholder="Ex: 4,20"
            onBlur={onWeightBlur}
            onChange={onWeightChange}
          />
          <MeasurementInputField
            label="ALTURA"
            unit="cm"
            value={height}
            placeholder="0.0"
            onChange={onHeightChange}
          />
          <MeasurementInputField
            label="CEFALIA"
            unit="cm"
            value={cephalicPerimeter}
            placeholder="0.0"
            className="relative sm:col-span-2"
            onChange={onCephalicPerimeterChange}
          />

          <p className="sm:col-span-2 font-data text-xs leading-relaxed text-[#88AFC7]">
            Ao salvar a consulta, essa medicao tambem sera adicionada em Crescimento.
          </p>

          {error ? (
            <p className="sm:col-span-2 font-data text-xs leading-relaxed text-[#CD8282]">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
