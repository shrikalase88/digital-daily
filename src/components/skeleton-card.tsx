export function SkeletonCard({ hasImage = true }: { hasImage?: boolean }) {
  return (
    <article className="flex flex-col w-full ios-glass-elevated rounded-2xl overflow-hidden">
      {hasImage && (
        <div className="relative w-full bg-slate-950/50 shrink-0 border-b border-white/5">
          <div className="aspect-[16/9] w-full animate-pulse bg-white/[0.03]" />
        </div>
      )}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
        <div className="space-y-3">
          <div className="h-5 w-20 rounded-full animate-pulse bg-white/[0.04]" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded animate-pulse bg-white/[0.04]" />
            <div className="h-4 w-3/4 rounded animate-pulse bg-white/[0.04]" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-full rounded animate-pulse bg-white/[0.03]" />
            <div className="h-3 w-2/3 rounded animate-pulse bg-white/[0.03]" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
          <div className="h-3 w-24 rounded animate-pulse bg-white/[0.03]" />
          <div className="h-3 w-16 rounded animate-pulse bg-white/[0.03]" />
        </div>
      </div>
    </article>
  );
}

export function SkeletonHero() {
  return (
    <div className="grid gap-6 lg:grid-cols-3 mb-10">
      <div className="ios-glass rounded-3xl overflow-hidden lg:col-span-2">
        <div className="aspect-[16/9] sm:aspect-[21/9] w-full animate-pulse bg-white/[0.03]" />
        <div className="p-5 sm:p-8 space-y-3">
          <div className="h-5 w-20 rounded-full animate-pulse bg-white/[0.04]" />
          <div className="h-7 w-3/4 rounded animate-pulse bg-white/[0.04]" />
          <div className="h-4 w-1/2 rounded animate-pulse bg-white/[0.03]" />
        </div>
      </div>
      <div className="ios-glass rounded-3xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-white/[0.06]" />
          <div className="h-3 w-24 rounded animate-pulse bg-white/[0.04]" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-2">
              <div className="h-6 w-6 rounded-full shrink-0 animate-pulse bg-white/[0.04]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-full rounded animate-pulse bg-white/[0.04]" />
                <div className="h-2.5 w-1/3 rounded animate-pulse bg-white/[0.03]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <SkeletonCard key={i} hasImage={i % 3 !== 0} />
      ))}
    </div>
  );
}
