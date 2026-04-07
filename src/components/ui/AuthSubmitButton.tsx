interface AuthSubmitButtonProps {
  loadingText: string;
  defaultText: string;
  isPending: boolean;
}

/**
 * Submit button with loading state for auth forms.
 */
export function AuthSubmitButton({
  loadingText,
  defaultText,
  isPending,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="
        w-full mt-6
        bg-primary text-on-primary
        rounded-2xl py-4 px-6
        font-display text-base font-semibold
        tracking-tight
        transition-all duration-300
        hover:shadow-[var(--shadow-btn-primary)]
        active:scale-[0.99]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
      "
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              fill="currentColor"
              className="opacity-75"
            />
          </svg>
          {loadingText}
        </span>
      ) : (
        defaultText
      )}
    </button>
  );
}
