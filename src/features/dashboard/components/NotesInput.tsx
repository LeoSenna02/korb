"use client";

interface NotesInputProps {
  value: string;
  onChange: (notes: string) => void;
}

export function NotesInput({ value, onChange }: NotesInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Ex: Mudança na cor, irritação na pele..."
      className="w-full bg-surface-variant/5 border border-outline/5 rounded-2xl p-4 font-data text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all min-h-[120px] resize-none"
    />
  );
}
