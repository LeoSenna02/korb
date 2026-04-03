export default function HistoryLoading() {
  return (
    <>
      <header className="px-6 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-variant/30 animate-pulse" />
            <div className="h-5 w-12 bg-surface-variant/30 rounded-lg animate-pulse" />
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-variant/20 animate-pulse" />
        </div>
        <div className="h-8 w-40 bg-surface-variant/30 rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-56 bg-surface-variant/20 rounded-lg animate-pulse" />
      </header>
      <main className="px-6 pb-36 space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-20 bg-surface-variant/20 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-surface-container rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-variant/20 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-surface-variant/25 rounded-lg animate-pulse" />
                  <div className="h-3 w-20 bg-surface-variant/15 rounded-lg animate-pulse" />
                </div>
                <div className="h-3 w-12 bg-surface-variant/15 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
