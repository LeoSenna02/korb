import React, { useId } from "react";

interface FormFieldProps {
  label: string;
  id?: string;
  error?: string;
  disabled?: boolean;
  rightElement?: React.ReactNode;
  children: React.ReactElement<
    React.InputHTMLAttributes<HTMLInputElement>
  >;
}

/**
 * Generic form field component that wraps:
 * - Label
 * - Input (or any input-like element)
 * - Optional right-side element (e.g., password toggle)
 * - Error message
 *
 * Handles ID linking between label and input automatically.
 */
export function FormField({
  label,
  id,
  error,
  disabled,
  rightElement,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const child = React.cloneElement(children, {
    id: inputId,
    disabled,
    "aria-invalid": error ? "true" : "false",
    "aria-describedby": error ? `${inputId}-error` : undefined,
    className: `
      w-full bg-surface-container-low rounded-2xl px-4 py-3.5
      font-data text-sm text-text-primary
      placeholder:text-text-placeholder
      border transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-primary/40
      disabled:opacity-50 disabled:cursor-not-allowed
      ${error ? "border-[#CD8282]/50" : "border-surface-variant/30"}
      ${rightElement ? "pr-12" : ""}
      ${children.props.className ?? ""}
    `,
  });

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block font-data text-[10px] uppercase tracking-wider text-text-disabled mb-2"
      >
        {label}
      </label>

      <div className="relative">
        {child}

        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 font-data text-[11px] text-[#CD8282]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
