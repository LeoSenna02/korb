interface AuthErrorBannerProps {
  message: string | null;
}

/**
 * Error banner displayed at the top of auth forms.
 */
export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 bg-[#CD8282]/10 border border-[#CD8282]/20 rounded-2xl p-4">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 text-[#CD8282] flex-shrink-0 mt-0.5"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <p className="font-data text-[13px] text-[#CD8282] leading-relaxed">
        {message}
      </p>
    </div>
  );
}
