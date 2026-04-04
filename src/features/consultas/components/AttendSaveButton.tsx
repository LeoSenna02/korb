import { Check } from "lucide-react";

interface AttendSaveButtonProps {
  isSaving: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function AttendSaveButton({
  isSaving,
  disabled,
  onClick,
}: AttendSaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-primary font-display font-semibold text-on-primary shadow-xl shadow-primary/10 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
    >
      <Check className="h-6 w-6" strokeWidth={2.5} />
      {isSaving ? "Salvando..." : "Salvar conclusao"}
    </button>
  );
}
