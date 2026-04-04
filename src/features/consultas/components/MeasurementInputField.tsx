import { Input } from "@/components/ui/Input";

interface MeasurementInputFieldProps {
  label: string;
  unit: string;
  value: string;
  placeholder: string;
  className?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export function MeasurementInputField({
  label,
  unit,
  value,
  placeholder,
  className,
  onChange,
  onBlur,
}: MeasurementInputFieldProps) {
  return (
    <div className={className ?? "relative"}>
      <Input
        label={label}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        className="bg-surface-container-low border-none h-14"
      />
      <span className="absolute right-4 bottom-[14px] font-data text-xs uppercase text-text-secondary">
        {unit}
      </span>
    </div>
  );
}
