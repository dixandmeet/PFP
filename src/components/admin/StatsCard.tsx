import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  accentColor?: string
  variant?: "kpi" | "role" | "default"
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  accentColor,
  variant = "default",
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "relative bg-white rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        "border border-slate-100",
        className
      )}
    >
      {variant === "role" && accentColor && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
          style={{ backgroundColor: accentColor }}
        />
      )}

      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className={cn(
            "font-medium text-slate-400 tracking-wide uppercase",
            variant === "kpi" ? "text-[13px]" : "text-xs"
          )}>
            {title}
          </p>
          <p className={cn(
            "font-bold text-slate-900 tabular-nums",
            variant === "kpi" ? "text-[36px] leading-none" : "text-2xl"
          )}>
            {value.toLocaleString()}
          </p>
        </div>
        {Icon && (
          <div className="p-2 bg-slate-50 rounded-lg">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-3 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold",
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-400">{description}</span>
          )}
        </div>
      )}
    </div>
  )
}
