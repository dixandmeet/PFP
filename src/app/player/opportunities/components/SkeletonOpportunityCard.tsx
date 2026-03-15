export function SkeletonOpportunityCard() {
  return (
    <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-5 w-5 bg-slate-100 rounded" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-5 bg-slate-200 rounded-full" />
        <div className="h-4 bg-slate-200 rounded w-1/3" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
      </div>
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 bg-slate-100 rounded-md w-14" />
        <div className="h-5 bg-slate-100 rounded-md w-20" />
        <div className="h-5 bg-slate-100 rounded-md w-16" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="h-4 bg-slate-100 rounded w-24" />
        <div className="h-4 bg-slate-100 rounded w-28" />
      </div>
      <div className="h-9 bg-slate-100 rounded-xl w-full" />
    </div>
  )
}
