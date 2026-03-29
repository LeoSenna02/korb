"use client";

type FeedingType = "left" | "right" | "bottle" | "both";

interface FeedingTypeSelectorProps {
  value: FeedingType;
  onChange: (type: FeedingType) => void;
}

export function FeedingTypeSelector({ value, onChange }: FeedingTypeSelectorProps) {
  const options = [
    { id: "both", label: "Seio" },
    { id: "bottle", label: "Mamadeira" },
  ];

  return (
    <div className="bg-surface-container-highest/50 p-1.5 rounded-2xl flex gap-1 mb-10">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id as FeedingType)}
          className={`flex-1 py-3.5 rounded-xl font-display text-sm font-medium transition-all duration-300 ${value === opt.id
              ? "bg-surface-variant text-text-primary shadow-sm"
              : "text-text-disabled hover:text-text-secondary"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
