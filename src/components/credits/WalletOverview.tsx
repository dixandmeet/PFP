"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Wallet,
  ShoppingCart,
  TrendingUp,
  Gift,
  Coins,
} from "lucide-react"

interface WalletData {
  subscription: number
  purchased: number
  earned: number
  bonus: number
  totalBalance: number
  plan: string | null
  planStatus: string | null
}

interface WalletOverviewProps {
  data: WalletData | null
  loading?: boolean
}

const walletCards = [
  {
    key: "subscription" as const,
    label: "Abonnement",
    icon: Wallet,
    color: "from-pitch-500 to-pitch-600",
    iconBg: "bg-pitch-100 text-pitch-600",
  },
  {
    key: "purchased" as const,
    label: "Achetes",
    icon: ShoppingCart,
    color: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    key: "earned" as const,
    label: "Gagnes",
    icon: TrendingUp,
    color: "from-victory-500 to-victory-600",
    iconBg: "bg-victory-100 text-victory-600",
  },
  {
    key: "bonus" as const,
    label: "Bonus",
    icon: Gift,
    color: "from-gold-400 to-gold-500",
    iconBg: "bg-gold-100 text-gold-600",
  },
]

function WalletSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 bg-stadium-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stadium-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export function WalletOverview({ data, loading }: WalletOverviewProps) {
  if (loading || !data) return <WalletSkeleton />

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="relative bg-gradient-to-br from-pitch-600 via-pitch-500 to-pitch-700 p-6 text-white">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl" />
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-pitch-100 text-sm font-medium mb-1">Solde total</p>
              <p className="text-4xl font-bold">{data.totalBalance}</p>
              <p className="text-pitch-200 text-sm mt-1">credits disponibles</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Coins className="h-8 w-8 text-gold-300" />
            </div>
          </div>
          {data.plan && (
            <div className="relative mt-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold">
                Plan {data.plan}
              </span>
              {data.planStatus === "ACTIVE" && (
                <span className="px-3 py-1 bg-green-400/20 text-green-200 rounded-full text-xs font-semibold">
                  Actif
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {walletCards.map((wallet) => {
          const Icon = wallet.icon
          const value = data[wallet.key]
          return (
            <Card key={wallet.key} className="border border-stadium-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2 rounded-lg", wallet.iconBg)}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-stadium-800">{value}</p>
                <p className="text-xs text-stadium-500 mt-0.5">{wallet.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
