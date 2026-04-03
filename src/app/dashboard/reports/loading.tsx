export default function ReportsLoading() {
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
        <div className="h-8 w-36 bg-surface-variant/30 rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-60 bg-surface-variant/20 rounded-lg animate-pulse" />
      </header>
      <main className="px-6 pb-36 space-y-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 flex-1 bg-surface-variant/20 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container rounded-2xl p-4 space-y-3">
              <div className="h-4 w-20 bg-surface-variant/25 rounded-lg animate-pulse" />
              <div className="h-8 w-16 bg-surface-variant/30 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-surface-container rounded-2xl p-5 space-y-4">
          <div className="h-5 w-32 bg-surface-variant/25 rounded-lg animate-pulse" />
          <div className="h-48 bg-surface-variant/15 rounded-xl animate-pulse" />
        </div>
      </main>
    </>
  );
}
