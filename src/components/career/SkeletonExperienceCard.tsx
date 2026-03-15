"use client"

export function SkeletonExperienceCard() {
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-3 w-3 h-3 rounded-full bg-slate-200" />
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-5 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-5 w-32 bg-slate-100 rounded" />
            <div className="h-5 w-16 bg-slate-100 rounded" />
          </div>
          <div className="flex gap-1">
            <div className="h-8 w-8 bg-slate-100 rounded-lg" />
            <div className="h-8 w-8 bg-slate-100 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-3 mb-3">
          <div className="h-4 w-24 bg-slate-100 rounded" />
          <div className="h-4 w-20 bg-slate-100 rounded" />
          <div className="h-4 w-28 bg-slate-100 rounded" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="h-5 w-8 bg-slate-100 rounded mx-auto" />
              <div className="h-3 w-12 bg-slate-100 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
