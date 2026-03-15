"use client"

export function SkeletonReportCard() {
  return (
    <div className="bg-white ring-1 ring-stadium-200 rounded-2xl shadow-sm p-4 space-y-3 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-stadium-100 rounded-lg w-3/4" />
          <div className="h-4 bg-stadium-100 rounded-lg w-1/2" />
        </div>
        <div className="h-5 w-16 bg-stadium-100 rounded-full shrink-0" />
      </div>
      <div className="flex gap-2">
        <div className="h-3 w-6 bg-stadium-100 rounded" />
        <div className="h-3 w-14 bg-stadium-100 rounded" />
      </div>
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 bg-stadium-100 rounded-full shrink-0" />
        <div className="space-y-1 flex-1">
          <div className="h-3 bg-stadium-100 rounded w-24" />
          <div className="h-2.5 bg-stadium-100 rounded w-16" />
        </div>
      </div>
      <div className="pt-2 border-t border-stadium-100 flex gap-1.5">
        <div className="flex-1 h-8 bg-stadium-100 rounded-xl" />
        <div className="h-8 w-8 bg-stadium-100 rounded-xl" />
        <div className="h-8 w-8 bg-stadium-100 rounded-xl" />
      </div>
    </div>
  )
}
