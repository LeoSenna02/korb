export default function ProfileLoading() {
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
        <div className="h-8 w-28 bg-surface-variant/30 rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-48 bg-surface-variant/20 rounded-lg animate-pulse" />
      </header>
      <main className="px-6 pb-36 space-y-4">
        <div className="bg-surface-container rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-variant/25 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-28 bg-surface-variant/25 rounded-lg animate-pulse" />
            <div className="h-3 w-20 bg-surface-variant/15 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 flex-1 bg-surface-variant/20 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="bg-surface-container rounded-2xl p-5 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="h-4 w-28 bg-surface-variant/20 rounded-lg animate-pulse" />
              <div className="h-4 w-16 bg-surface-variant/15 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
