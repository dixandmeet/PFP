import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex p-6 bg-gradient-to-br from-pitch-100 to-pitch-50 rounded-full mb-6">
        <Icon className="h-16 w-16 text-pitch-400" />
      </div>
      <h3 className="text-xl font-bold text-stadium-900 mb-2">
        {title}
      </h3>
      <p className="text-stadium-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
