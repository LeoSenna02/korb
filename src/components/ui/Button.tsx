import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "tertiary";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary:
    "bg-primary-container text-on-primary-container hover:bg-primary btn-glow-primary",
  secondary:
    "bg-secondary-container text-on-secondary-container hover:bg-secondary btn-glow-secondary",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface-container-high btn-glow-ghost",
  tertiary:
    "bg-tertiary-container text-on-tertiary-container hover:opacity-90",
};

const sizeStyles = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-base",
  lg: "h-14 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "lg",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          rounded-xl
          font-display font-medium
          flex items-center justify-center gap-2
          transition-all duration-200
          active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
