"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Coins,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface TransactionUser {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
}

interface Transaction {
  id: string
  userId: string
  walletType: string
  type: string
  status: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  referenceId: string | null
  referenceType: string | null
  counterpartyId: string | null
  description: string | null
  metadata: any
  createdAt: string
  user: TransactionUser
}

interface Stats {
  totalCredits: number
  totalCreditsCount: number
  totalDebits: number
  totalDebitsCount: number
  totalExpirations: number
  totalExpirationsCount: number
  totalWalletBalance: number
  walletsByType: { type: string; totalBalance: number; count: number }[]
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const walletTypeLabels: Record<string, string> = {
  SUBSCRIPTION: "Abonnement",
  PURCHASED: "Achetes",
  EARNED: "Gagnes",
  BONUS: "Bonus",
}

const transactionTypeLabels: Record<string, { label: string; isCredit: boolean }> = {
  CREDIT_SUBSCRIPTION: { label: "Allocation abonnement", isCredit: true },
  CREDIT_PURCHASE: { label: "Achat de credits", isCredit: true },
  CREDIT_BONUS: { label: "Bonus", isCredit: true },
  CREDIT_EARNED_FOLLOW: { label: "Gain follower", isCredit: true },
  CREDIT_EARNED_LISTING: { label: "Gain annonce", isCredit: true },
  CREDIT_EARNED_SIGNATURE: { label: "Gain signature", isCredit: true },
  DEBIT_FOLLOW: { label: "Cout follow", isCredit: false },
  DEBIT_LISTING_CONSULT: { label: "Consultation annonce", isCredit: false },
  DEBIT_WITHDRAWAL: { label: "Retrait", isCredit: false },
  EXPIRATION: { label: "Expiration", isCredit: false },
  REFUND: { label: "Ajustement admin", isCredit: false },
}

const statusLabels: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: "Termine", color: "bg-emerald-100 text-emerald-700" },
  PENDING: { label: "En attente", color: "bg-amber-100 text-amber-700" },
  FAILED: { label: "Echoue", color: "bg-red-100 text-red-700" },
  REVERSED: { label: "Annule", color: "bg-slate-100 text-slate-600" },
}

const roleLabels: Record<string, string> = {
  PLAYER: "Joueur",
  AGENT: "Agent",
  CLUB: "Club",
  ADMIN: "Admin",
}

export default function AdminCreditsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [walletTypeFilter, setWalletTypeFilter] = useState("all")
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortOrder,
      })
      if (search) params.set("search", search)
      if (walletTypeFilter !== "all") params.set("walletType", walletTypeFilter)
      if (transactionTypeFilter !== "all") params.set("transactionType", transactionTypeFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)

      const res = await fetch(`/api/admin/credits?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions)
        setPagination(data.pagination)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, search, walletTypeFilter, transactionTypeFilter, statusFilter, dateFrom, dateTo, sortOrder])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const resetFilters = () => {
    setSearch("")
    setWalletTypeFilter("all")
    setTransactionTypeFilter("all")
    setStatusFilter("all")
    setDateFrom("")
    setDateTo("")
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const hasActiveFilters =
    search || walletTypeFilter !== "all" || transactionTypeFilter !== "all" || statusFilter !== "all" || dateFrom || dateTo

  return (
    <div>
      <AdminHeader
        title="Credits & Transactions"
        description="Vue d'ensemble des transactions et soldes de credits"
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Card className="p-4 border-blue-200 bg-blue-50/50">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Solde total</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.totalWalletBalance.toLocaleString()}</p>
              <p className="text-xs text-blue-600/70">credits en circulation</p>
            </Card>

            <Card className="p-4 border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Credits</span>
              </div>
              <p className="text-2xl font-bold text-emerald-900">+{stats.totalCredits.toLocaleString()}</p>
              <p className="text-xs text-emerald-600/70">{stats.totalCreditsCount} transactions</p>
            </Card>

            <Card className="p-4 border-red-200 bg-red-50/50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Debits</span>
              </div>
              <p className="text-2xl font-bold text-red-900">-{stats.totalDebits.toLocaleString()}</p>
              <p className="text-xs text-red-600/70">{stats.totalDebitsCount} transactions</p>
            </Card>

            <Card className="p-4 border-amber-200 bg-amber-50/50">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">Expirations</span>
              </div>
              <p className="text-2xl font-bold text-amber-900">{stats.totalExpirations.toLocaleString()}</p>
              <p className="text-xs text-amber-600/70">{stats.totalExpirationsCount} expirations</p>
            </Card>

            <Card className="p-4">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Par wallet</div>
              <div className="space-y-1">
                {stats.walletsByType.map((w) => (
                  <div key={w.type} className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">{walletTypeLabels[w.type] || w.type}</span>
                    <span className="text-xs font-semibold text-slate-900">{w.totalBalance.toLocaleString()}</span>
                  </div>
                ))}
                {stats.walletsByType.length === 0 && (
                  <p className="text-xs text-slate-400">Aucun wallet</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Filtres</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-auto text-xs h-7">
                Reinitialiser
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom, email, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>

            {/* Wallet type */}
            <Select value={walletTypeFilter} onValueChange={(v) => { setWalletTypeFilter(v); setPagination((p) => ({ ...p, page: 1 })) }}>
              <SelectTrigger className="h-9 text-sm">
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

            {/* Transaction type */}
            <Select value={transactionTypeFilter} onValueChange={(v) => { setTransactionTypeFilter(v); setPagination((p) => ({ ...p, page: 1 })) }}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="CREDIT_SUBSCRIPTION">Allocation abo</SelectItem>
                <SelectItem value="CREDIT_PURCHASE">Achat</SelectItem>
                <SelectItem value="CREDIT_BONUS">Bonus</SelectItem>
                <SelectItem value="CREDIT_EARNED_FOLLOW">Gain follow</SelectItem>
                <SelectItem value="CREDIT_EARNED_LISTING">Gain annonce</SelectItem>
                <SelectItem value="CREDIT_EARNED_SIGNATURE">Gain signature</SelectItem>
                <SelectItem value="DEBIT_FOLLOW">Cout follow</SelectItem>
                <SelectItem value="DEBIT_LISTING_CONSULT">Consultation</SelectItem>
                <SelectItem value="DEBIT_WITHDRAWAL">Retrait</SelectItem>
                <SelectItem value="EXPIRATION">Expiration</SelectItem>
                <SelectItem value="REFUND">Ajustement</SelectItem>
              </SelectContent>
            </Select>

            {/* Date from */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPagination((p) => ({ ...p, page: 1 })) }}
                className="pl-9 h-9 text-sm"
                placeholder="Du"
              />
            </div>

            {/* Date to */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPagination((p) => ({ ...p, page: 1 })) }}
                className="pl-9 h-9 text-sm"
                placeholder="Au"
              />
            </div>
          </div>
        </Card>

        {/* Transactions table */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700">
                Transactions ({pagination.total.toLocaleString()})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={sortOrder}
                onValueChange={(v) => setSortOrder(v as "asc" | "desc")}
              >
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Plus recentes</SelectItem>
                  <SelectItem value="asc">Plus anciennes</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchTransactions} className="h-8">
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {isLoading && transactions.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <Coins className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">Aucune transaction trouvee</p>
              <p className="text-xs text-slate-400 mt-1">Modifiez vos filtres pour voir plus de resultats</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Solde</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => {
                      const typeConfig = transactionTypeLabels[tx.type] || { label: tx.type, isCredit: false }
                      const isCredit = typeConfig.isCredit
                      const statusConfig = statusLabels[tx.status] || { label: tx.status, color: "bg-slate-100 text-slate-600" }

                      return (
                        <TableRow
                          key={tx.id}
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => router.push(`/admin/users/${tx.userId}`)}
                        >
                          {/* Icon */}
                          <TableCell>
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center ${isCredit ? "bg-emerald-50" : "bg-red-50"}`}>
                              {isCredit ? (
                                <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                              )}
                            </div>
                          </TableCell>

                          {/* User */}
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={tx.user.image || undefined} />
                                <AvatarFallback className="text-xs bg-slate-100">
                                  {(tx.user.name || tx.user.email)[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate max-w-[140px]">
                                  {tx.user.name || tx.user.email.split("@")[0]}
                                </p>
                                <p className="text-xs text-slate-400 truncate max-w-[140px]">
                                  {roleLabels[tx.user.role] || tx.user.role}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Type */}
                          <TableCell>
                            <span className="text-sm text-slate-700">{typeConfig.label}</span>
                          </TableCell>

                          {/* Wallet */}
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {walletTypeLabels[tx.walletType] || tx.walletType}
                            </Badge>
                          </TableCell>

                          {/* Amount */}
                          <TableCell className="text-right">
                            <span className={`text-sm font-bold ${isCredit ? "text-emerald-600" : "text-red-500"}`}>
                              {isCredit ? "+" : "-"}{tx.amount}
                            </span>
                          </TableCell>

                          {/* Balance */}
                          <TableCell>
                            <span className="text-xs text-slate-500">
                              {tx.balanceBefore} → {tx.balanceAfter}
                            </span>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </TableCell>

                          {/* Description */}
                          <TableCell>
                            <p className="text-xs text-slate-500 truncate max-w-[180px]">
                              {tx.description || "-"}
                            </p>
                          </TableCell>

                          {/* Date */}
                          <TableCell>
                            <div>
                              <p className="text-xs text-slate-700">
                                {format(new Date(tx.createdAt), "dd/MM/yy HH:mm", { locale: fr })}
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: fr })}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t bg-slate-50/50">
                  <p className="text-xs text-slate-500">
                    Page {pagination.page} sur {pagination.totalPages} ({pagination.total} resultats)
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(1)}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum: number
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.page - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0 text-xs"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.totalPages)}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
