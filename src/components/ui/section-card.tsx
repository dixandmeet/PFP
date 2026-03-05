import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

interface SectionCardProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({ 
  title, 
  subtitle, 
  icon: Icon, 
  action, 
  children,
  className = "" 
}: SectionCardProps) {
  return (
    <div className={`card-stadium ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {Icon && (
                <div className="p-2 bg-gradient-to-br from-pitch-500 to-pitch-600 rounded-lg">
                  <Icon className="h-5 w-5 text-white" />
                </div>
              )}
              <h2 className="text-2xl font-black text-stadium-900">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-stadium-600">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
        {children}
      </div>
    </div>
  )
}
