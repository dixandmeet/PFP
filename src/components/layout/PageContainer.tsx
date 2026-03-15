import { ReactNode } from "react"

interface PageContainerProps {
  children: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl"
}

export function PageContainer({ children, maxWidth = "7xl" }: PageContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    "7xl": "max-w-7xl"
  }

  return (
    <div className="min-h-screen pitch-pattern">
      <div className={`container mx-auto px-4 py-4 sm:p-6 space-y-6 sm:space-y-8 ${maxWidthClasses[maxWidth]}`}>
        {children}
      </div>
    </div>
  )
}
