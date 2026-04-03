export default function GrowthLoading() {
  return (
    <div className="px-6 pt-12 pb-36 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-variant/20 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-surface-variant/30 animate-pulse" />
        </div>
        <div className="h-10 w-10 rounded-full bg-surface-variant/20 animate-pulse" />
      </div>
      <div className="h-8 w-44 bg-surface-variant/30 rounded-xl animate-pulse mb-1" />
      <div className="h-4 w-56 bg-surface-variant/20 rounded-lg animate-pulse" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-container rounded-2xl p-4 space-y-3">
            <div className="h-3 w-14 bg-surface-variant/20 rounded-lg animate-pulse" />
            <div className="h-7 w-16 bg-surface-variant/30 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-surface-container rounded-2xl p-5 space-y-4">
        <div className="h-5 w-32 bg-surface-variant/25 rounded-lg animate-pulse" />
        <div className="h-48 bg-surface-variant/15 rounded-xl animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-container rounded-2xl p-4 flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-surface-variant/25 rounded-lg animate-pulse" />
              <div className="h-3 w-36 bg-surface-variant/15 rounded-lg animate-pulse" />
            </div>
            <div className="h-4 w-14 bg-surface-variant/15 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
