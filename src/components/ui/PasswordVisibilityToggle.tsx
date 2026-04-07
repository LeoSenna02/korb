import { Eye, EyeOff } from "lucide-react";

interface PasswordVisibilityToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/**
 * Toggle button for showing/hiding password.
 * Must be used inside a FormField's rightElement prop.
 * The parent handles positioning (absolute + centered).
 */
export function PasswordVisibilityToggle({
  isVisible,
  onToggle,
  disabled,
}: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-text-disabled hover:text-text-secondary transition-colors duration-200 disabled:opacity-50"
      disabled={disabled}
      tabIndex={-1}
      aria-label={isVisible ? "Esconder senha" : "Mostrar senha"}
    >
      {isVisible ? (
        <EyeOff className="w-4 h-4" strokeWidth={1.5} />
      ) : (
        <Eye className="w-4 h-4" strokeWidth={1.5} />
      )}
    </button>
  );
}
