"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Transaction {
  id: string
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string | null
  walletType: string
  createdAt: string
}

interface TransactionListProps {
  compact?: boolean
  limit?: number
}

const typeLabels: Record<string, string> = {
  CREDIT_SUBSCRIPTION: "Credit abonnement",
  CREDIT_PURCHASE: "Achat de credits",
  CREDIT_BONUS: "Bonus",
  CREDIT_EARNED_FOLLOW: "Revenu follow",
  CREDIT_EARNED_LISTING: "Revenu consultation",
  CREDIT_EARNED_SIGNATURE: "Revenu signature",
  DEBIT_FOLLOW: "Debit follow",
  DEBIT_LISTING_CONSULT: "Debit consultation",
  DEBIT_PROFILE_VIEW: "Consultation profil",
  CREDIT_EARNED_PROFILE_VIEW: "Revenu consultation profil",
  DEBIT_WITHDRAWAL: "Retrait",
  EXPIRATION: "Expiration",
  REFUND: "Remboursement",
}

const walletTypeLabels: Record<string, string> = {
  SUBSCRIPTION: "Abonnement",
  PURCHASED: "Achetes",
  EARNED: "Gagnes",
  BONUS: "Bonus",
}

export function TransactionList({ compact = false, limit: defaultLimit = 20 }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [walletFilter, setWalletFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const pageSize = compact ? 5 : defaultLimit

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      })
      if (walletFilter !== "all") params.set("walletType", walletFilter)
      if (typeFilter !== "all") params.set("type", typeFilter)

      const res = await fetch(`/api/credits/transactions?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions || [])
        setTotal(data.total || 0)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, walletFilter, typeFilter])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const totalPages = Math.ceil(total / pageSize)
  const isCredit = (type: string) => type.startsWith("CREDIT_") || type === "REFUND"

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-stadium-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-stadium-400">
        <p className="text-sm">Aucune transaction pour le moment</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex flex-wrap gap-3">
          <Select value={walletFilter} onValueChange={(v) => { setWalletFilter(v); setPage(1) }}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2 text-stadium-400" />
              <SelectValue placeholder="Wallet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les wallets</SelectItem>
              <SelectItem value="SUBSCRIPTION">Abonnement</SelectItem>
              <SelectItem value="PURCHASED">Achetes</SelectItem>
              <SelectItem value="EARNED">Gagnes</SelectItem>
              <SelectItem value="BONUS">Bonus</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2 text-stadium-400" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(typeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        {transactions.map((tx) => (
          <Card key={tx.id} className="border border-stadium-100 hover:border-stadium-200 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-lg flex-shrink-0",
                isCredit(tx.type) ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
              )}>
                {isCredit(tx.type) ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stadium-800 truncate">
                  {typeLabels[tx.type] || tx.type}
                </p>
                {tx.description && (
                  <p className="text-xs text-stadium-400 truncate mt-0.5">{tx.description}</p>
                )}
              </div>

              <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                {walletTypeLabels[tx.walletType] || tx.walletType}
              </Badge>

              <div className="text-right flex-shrink-0">
                <p className={cn(
                  "text-sm font-bold",
                  isCredit(tx.type) ? "text-green-600" : "text-red-500"
                )}>
                  {isCredit(tx.type) ? "+" : "-"}{Math.abs(tx.amount)}
                </p>
                <p className="text-[10px] text-stadium-400">
                  {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!compact && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-stadium-400">
            {total} transaction{total > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-stadium-600">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
