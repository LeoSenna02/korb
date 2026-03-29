export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-surface-dim flex items-center justify-center z-[9999]">
      <div
        className="flex flex-col items-center gap-6"
        style={{ animation: "fade-in-up 0.4s ease-out both" }}
      >
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-24 h-24 rounded-full bg-primary/10"
            style={{ animation: "breathe 3s ease-in-out infinite" }}
          />
          <div
            className="absolute w-16 h-16 rounded-full bg-primary/15"
            style={{ animation: "breathe 3s ease-in-out infinite 0.3s" }}
          />
          <span className="font-display text-2xl font-semibold tracking-tight text-text-primary relative z-10">
            Korb
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-text-disabled"
              style={{
                animation: "dot-pulse 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
