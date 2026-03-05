"use client"

import { usePathname, useRouter } from "next/navigation"
import { Building2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const contexts = [
  { id: "club", label: "Club", icon: Building2, href: "/club/dashboard" },
  { id: "staff", label: "Admin", icon: ShieldCheck, href: "/club/staff/admin" },
] as const

export function ProfileSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  const activeContext = pathname.startsWith("/club/staff") ? "staff" : "club"

  return (
    <div className="mx-3 mt-2">
      <div className="flex rounded-lg bg-stadium-100 p-0.5">
        {contexts.map((ctx) => {
          const isActive = activeContext === ctx.id
          const Icon = ctx.icon
          return (
            <button
              key={ctx.id}
              onClick={() => {
                if (!isActive) router.push(ctx.href)
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                isActive
                  ? "bg-white text-stadium-900 shadow-sm"
                  : "text-stadium-500 hover:text-stadium-700"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {ctx.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
