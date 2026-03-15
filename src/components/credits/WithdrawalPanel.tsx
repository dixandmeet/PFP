"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Banknote,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Crown,
  ChevronRight,
} from "lucide-react"

interface Withdrawal {
  id: string
  amount: number
  commission: number
  netAmount: number
  status: string
  createdAt: string
  processedAt: string | null
}

interface ConnectStatus {
  hasAccount: boolean
  isOnboarded: boolean
  payoutsEnabled: boolean
  eligibleForConnect?: boolean
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  PENDING_REVIEW: { label: "En attente", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Approuve", icon: CheckCircle2, color: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "En cours", icon: Loader2, color: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Termine", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Refuse", icon: XCircle, color: "bg-red-100 text-red-700" },
  FAILED: { label: "Echoue", icon: XCircle, color: "bg-red-100 text-red-700" },
}

export function WithdrawalPanel({ earnedBalance }: { earnedBalance: number }) {
  const pathname = usePathname()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const [wRes, cRes] = await Promise.all([
        fetch("/api/credits/withdrawals"),
        fetch("/api/credits/connect/status"),
      ])
      if (wRes.ok) {
        const data = await wRes.json()
        setWithdrawals(data.withdrawals || [])
      }
      if (cRes.ok) {
        const data = await cRes.json()
        setConnectStatus(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleWithdraw = async () => {
    const numAmount = Number(amount)
    if (numAmount < 100) {
      setError("Minimum 100 credits")
      return
    }
    if (numAmount > earnedBalance) {
      setError("Solde insuffisant")
      return
    }
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/credits/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount }),
      })
      if (res.ok) {
        setAmount("")
        fetchData()
      } else {
        const data = await res.json()
        setError(data.error || "Erreur lors du retrait")
      }
    } catch {
      setError("Erreur reseau")
    } finally {
      setSubmitting(false)
    }
  }

  const handleOnboarding = async () => {
    try {
      const res = await fetch("/api/credits/connect/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl: typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}?tab=withdrawals` : undefined,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const url = data.onboardingUrl ?? data.url
        if (url) window.location.href = url
      } else {
        const err = await res.json().catch(() => ({}))
        setError(err.error || "Impossible de lancer la configuration")
      }
    } catch {
      setError("Erreur réseau")
    }
  }

  const commission = Math.round(Number(amount || 0) * 0.2)
  const netAmount = Number(amount || 0) - commission

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-stadium-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {connectStatus && connectStatus.eligibleForConnect === false && (
        <Card className="border-2 border-stadium-200 bg-stadium-50">
          <CardContent className="p-4 flex items-start gap-3">
            <Crown className="h-5 w-5 text-stadium-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-stadium-800">Formule requise</p>
              <p className="text-xs text-stadium-600 mt-1">
                Pour configurer un compte Stripe Connect et retirer vos crédits, vous devez être au minimum sur la formule Growth.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3 border-stadium-300 text-stadium-700">
                <Link href={`${pathname}?tab=subscription`}>
                  Voir les formules
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {connectStatus && connectStatus.eligibleForConnect !== false && !connectStatus.isOnboarded && (
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">Vérification requise</p>
              <p className="text-xs text-yellow-700 mt-1">
                Pour retirer vos crédits, vous devez d'abord configurer votre compte Stripe Connect.
              </p>
              <Button
                onClick={handleOnboarding}
                size="sm"
                className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Configurer mon compte
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {connectStatus?.isOnboarded && (
        <Card className="border border-stadium-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-victory-100 rounded-lg">
                <Banknote className="h-5 w-5 text-victory-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stadium-800">Demander un retrait</h3>
                <p className="text-xs text-stadium-500">
                  Minimum 100 credits - Commission 20% - Delai 7 jours
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-stadium-600">Solde retirable :</span>
                <span className="font-bold text-stadium-800">{earnedBalance} credits</span>
              </div>

              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stadium-400" />
                <input
                  type="number"
                  min="100"
                  placeholder="Montant a retirer..."
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError("") }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-stadium-200 rounded-xl text-sm focus:border-pitch-500 focus:ring-2 focus:ring-pitch-100 outline-none transition-all"
                />
              </div>

              {Number(amount) >= 100 && (
                <div className="bg-stadium-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stadium-500">Montant</span>
                    <span className="font-medium">{amount} credits</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Commission (20%)</span>
                    <span>-{commission}</span>
                  </div>
                  <div className="border-t border-stadium-200 pt-1 flex justify-between font-bold text-stadium-800">
                    <span>Montant net</span>
                    <span>{netAmount} credits = ~{netAmount}EUR</span>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> {error}
                </p>
              )}

              <Button
                onClick={handleWithdraw}
                disabled={Number(amount) < 100 || submitting}
                className="w-full bg-gradient-to-r from-victory-500 to-victory-600 hover:from-victory-600 hover:to-victory-700 text-white font-bold"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Demander le retrait"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {withdrawals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stadium-700 mb-3">Historique des retraits</h3>
          <div className="space-y-2">
            {withdrawals.map((w) => {
              const config = statusConfig[w.status] || statusConfig.PENDING_REVIEW
              const StatusIcon = config.icon
              return (
                <Card key={w.id} className="border border-stadium-100">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", config.color)}>
                      <StatusIcon className={cn("h-4 w-4", w.status === "PROCESSING" && "animate-spin")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stadium-800">
                        {w.amount} credits
                      </p>
                      <p className="text-xs text-stadium-400">
                        Net: {w.netAmount} credits
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={cn("text-xs", config.color)}>
                        {config.label}
                      </Badge>
                      <p className="text-[10px] text-stadium-400 mt-1">
                        {new Date(w.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
