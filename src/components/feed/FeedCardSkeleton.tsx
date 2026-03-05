"use client"

export function FeedCardSkeleton() {
  return (
    <div className="rounded-2xl border border-stadium-100 bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-stadium-100 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-stadium-100 rounded animate-pulse" />
          <div className="h-3 w-20 bg-stadium-50 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3.5 w-full bg-stadium-100 rounded animate-pulse" />
        <div className="h-3.5 w-4/5 bg-stadium-100 rounded animate-pulse" />
        <div className="h-3.5 w-3/5 bg-stadium-50 rounded animate-pulse" />
      </div>
      <div className="h-48 w-full bg-stadium-50 rounded-xl animate-pulse mb-4" />
      <div className="flex items-center gap-4 pt-4 border-t border-stadium-100">
        <div className="h-8 w-20 bg-stadium-50 rounded-lg animate-pulse" />
        <div className="h-8 w-20 bg-stadium-50 rounded-lg animate-pulse" />
        <div className="h-8 w-24 bg-stadium-50 rounded-lg animate-pulse" />
      </div>
    </div>
  )
}

export function FeedSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <FeedCardSkeleton key={i} />
      ))}
    </div>
  )
}
