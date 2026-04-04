interface AttendTextareaFieldProps {
  label: string;
  value: string;
  rows: number;
  placeholder: string;
  onChange: (value: string) => void;
}

export function AttendTextareaField({
  label,
  value,
  rows,
  placeholder,
  onChange,
}: AttendTextareaFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-data text-xs uppercase tracking-wider text-text-secondary">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl bg-surface-container-high p-4 font-data text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
