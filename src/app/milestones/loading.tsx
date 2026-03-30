"use client";

export default function Loading() {
  return (
    <div className="px-6 pt-4 pb-32">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-72 bg-surface-variant/30 rounded-xl animate-pulse" />
        <div className="h-4 w-48 bg-surface-variant/20 rounded-lg animate-pulse mt-3" />
      </div>

      {/* Progress card skeleton */}
      <div className="bg-surface-container rounded-3xl p-6 mb-6">
        <div className="h-6 w-40 bg-surface-variant/30 rounded-lg animate-pulse mb-3" />
        <div className="h-3 w-28 bg-surface-variant/20 rounded-lg animate-pulse mb-4" />
        <div className="h-2 bg-surface-variant/20 rounded-full animate-pulse" />
      </div>

      {/* Category cards skeleton */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-container rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-surface-variant/30 rounded-2xl animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-28 bg-surface-variant/30 rounded-lg animate-pulse mb-2" />
                <div className="h-3 w-20 bg-surface-variant/20 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-1.5 bg-surface-variant/20 rounded-full mb-5 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-4 py-3">
                  <div className="w-7 h-7 bg-surface-variant/20 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-surface-variant/20 rounded-lg animate-pulse mb-1" />
                    <div className="h-3 w-16 bg-surface-variant/15 rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
