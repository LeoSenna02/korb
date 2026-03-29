import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-2">
        <label
          htmlFor={inputId}
          className="font-data text-xs text-text-secondary uppercase tracking-wider"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-12 px-4
            bg-surface-container
            text-text-primary font-data text-sm
            rounded-xl
            placeholder:text-text-placeholder
            border-b-2 border-transparent
            focus:border-primary focus:outline-none
            transition-colors duration-200
            ${error ? "border-tertiary-container" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="font-data text-xs text-tertiary-container">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
