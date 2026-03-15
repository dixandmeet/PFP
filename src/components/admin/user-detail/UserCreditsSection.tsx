"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Banknote,
  Receipt,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import type {
  WalletEntry,
  CreditTransactionEntry,
  SubscriptionEntry,
  StripeConnectEntry,
  WithdrawalEntry,
} from "./types"

interface UserCreditsSectionProps {
  wallets: WalletEntry[]
  transactions: CreditTransactionEntry[]
  subscription: SubscriptionEntry | null
  stripeConnect: StripeConnectEntry | null
  withdrawals: WithdrawalEntry[]
  userId: string
  onAction: (action: string, data?: any) => Promise<void>
}

const walletLabels: Record<string, { label: string; icon: typeof Wallet; color: string }> = {
  SUBSCRIPTION: { label: "Abonnement", icon: CreditCard, color: "text-blue-600 bg-blue-50 border-blue-200" },
  PURCHASED: { label: "Achetes", icon: Banknote, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  EARNED: { label: "Gagnes", icon: TrendingUp, color: "text-purple-600 bg-purple-50 border-purple-200" },
  BONUS: { label: "Bonus", icon: Receipt, color: "text-amber-600 bg-amber-50 border-amber-200" },
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

const planLabels: Record<string, string> = {
  FREE: "Gratuit",
  STARTER: "Starter (10€/mois)",
  GROWTH: "Growth (50€/mois)",
  PRO: "Pro (200€/mois)",
  ELITE: "Elite (500€/mois)",
}

const withdrawalStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING_REVIEW: { label: "En attente", color: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Approuve", color: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "En cours", color: "bg-indigo-100 text-indigo-700" },
  COMPLETED: { label: "Termine", color: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Rejete", color: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Annule", color: "bg-slate-100 text-slate-600" },
}

const kycLabels: Record<string, { label: string; color: string }> = {
  NOT_STARTED: { label: "Non demarre", color: "text-slate-500" },
  PENDING: { label: "En cours", color: "text-amber-600" },
  VERIFIED: { label: "Verifie", color: "text-emerald-600" },
  REJECTED: { label: "Rejete", color: "text-red-600" },
}

export function UserCreditsSection({
  wallets,
  transactions,
  subscription,
  stripeConnect,
  withdrawals,
  userId,
  onAction,
}: UserCreditsSectionProps) {
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [creditMode, setCreditMode] = useState<"credit" | "debit">("credit")
  const [creditWalletType, setCreditWalletType] = useState("BONUS")
  const [creditAmount, setCreditAmount] = useState("")
  const [creditDescription, setCreditDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txFilter, setTxFilter] = useState<string>("all")

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

  const handleCreditSubmit = async () => {
    const amount = parseInt(creditAmount)
    if (!amount || amount <= 0) return

    setIsSubmitting(true)
    try {
      await onAction(creditMode === "credit" ? "creditWallet" : "debitWallet", {
        walletType: creditWalletType,
        amount,
        description: creditDescription || undefined,
      })
      setCreditDialogOpen(false)
      setCreditAmount("")
      setCreditDescription("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTransactions = txFilter === "all"
    ? transactions
    : transactions.filter((tx) => tx.walletType === txFilter)

  return (
    <div className="space-y-6">
      {/* Solde total + Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Credits & Finance</h3>
          <p className="text-sm text-slate-500">
            Solde total : <span className="font-bold text-slate-900 text-base">{totalBalance} credits</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              setCreditMode("credit")
              setCreditWalletType("BONUS")
              setCreditDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Crediter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCreditMode("debit")
              setCreditWalletType("BONUS")
              setCreditDialogOpen(true)
            }}
          >
            <Minus className="h-4 w-4 mr-1.5" />
            Debiter
          </Button>
        </div>
      </div>

      {/* Wallets grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(["SUBSCRIPTION", "PURCHASED", "EARNED", "BONUS"] as const).map((type) => {
          const wallet = wallets.find((w) => w.type === type)
          const config = walletLabels[type]
          const Icon = config.icon
          return (
            <Card key={type} className={`p-4 border ${wallet ? config.color : "border-dashed border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">{config.label}</span>
              </div>
              <p className="text-2xl font-bold">{wallet?.balance ?? 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">credits</p>
            </Card>
          )
        })}
      </div>

      {/* Subscription & Stripe Connect */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subscription */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b">
            <CreditCard className="h-4 w-4 text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-700">Abonnement</h4>
          </div>
          <div className="p-5">
            {subscription ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Plan</span>
                  <Badge variant="secondary">{planLabels[subscription.plan] || subscription.plan}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Statut</span>
                  <span className={`text-sm font-medium ${subscription.status === "ACTIVE" ? "text-emerald-600" : subscription.status === "PAST_DUE" ? "text-red-600" : "text-slate-500"}`}>
                    {subscription.status === "ACTIVE" ? "Actif" : subscription.status === "CANCELLED" ? "Annule" : subscription.status === "PAST_DUE" ? "Impaye" : subscription.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Credits alloues</span>
                  <span className="text-sm font-medium">{subscription.creditsAllocated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Periode</span>
                  <span className="text-xs text-slate-600">
                    {format(new Date(subscription.currentPeriodStart), "dd/MM/yy", { locale: fr })} - {format(new Date(subscription.currentPeriodEnd), "dd/MM/yy", { locale: fr })}
                  </span>
                </div>
                {subscription.cancelledAt && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    Annule le {format(new Date(subscription.cancelledAt), "dd/MM/yyyy", { locale: fr })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Aucun abonnement</p>
              </div>
            )}
          </div>
        </Card>

        {/* Stripe Connect */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b">
            <Shield className="h-4 w-4 text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-700">Stripe Connect</h4>
          </div>
          <div className="p-5">
            {stripeConnect ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Compte</span>
                  <span className="text-xs font-mono text-slate-600">{stripeConnect.stripeAccountId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">KYC</span>
                  <span className={`text-sm font-medium ${kycLabels[stripeConnect.kycStatus]?.color || "text-slate-500"}`}>
                    {kycLabels[stripeConnect.kycStatus]?.label || stripeConnect.kycStatus}
                  </span>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className={`mx-auto h-6 w-6 rounded-full flex items-center justify-center ${stripeConnect.detailsSubmitted ? "bg-emerald-100" : "bg-slate-100"}`}>
                      {stripeConnect.detailsSubmitted ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-slate-400" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Details</p>
                  </div>
                  <div>
                    <div className={`mx-auto h-6 w-6 rounded-full flex items-center justify-center ${stripeConnect.chargesEnabled ? "bg-emerald-100" : "bg-slate-100"}`}>
                      {stripeConnect.chargesEnabled ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-slate-400" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Charges</p>
                  </div>
                  <div>
                    <div className={`mx-auto h-6 w-6 rounded-full flex items-center justify-center ${stripeConnect.payoutsEnabled ? "bg-emerald-100" : "bg-slate-100"}`}>
                      {stripeConnect.payoutsEnabled ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-slate-400" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Virements</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-center">
                  Cree {formatDistanceToNow(new Date(stripeConnect.createdAt), { addSuffix: true, locale: fr })}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <Shield className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Pas de compte Stripe Connect</p>
                <p className="text-xs text-slate-400 mt-1">L&apos;utilisateur ne peut pas recevoir de virements</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Withdrawals */}
      {withdrawals.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b">
            <Banknote className="h-4 w-4 text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-700">Retraits ({withdrawals.length})</h4>
          </div>
          <div className="divide-y">
            {withdrawals.map((w) => {
              const statusConfig = withdrawalStatusLabels[w.status] || { label: w.status, color: "bg-slate-100 text-slate-600" }
              return (
                <div key={w.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{w.amount} credits</span>
                      <span className="text-xs text-slate-400">→</span>
                      <span className="text-sm text-slate-600">{(w.netAmount / 100).toFixed(2)}€ net</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Demande {format(new Date(w.requestedAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                      {" · "}Commission: {w.commission} credits
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Transactions */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-700">Transactions ({filteredTransactions.length})</h4>
          </div>
          <Select value={txFilter} onValueChange={setTxFilter}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les wallets</SelectItem>
              <SelectItem value="SUBSCRIPTION">Abonnement</SelectItem>
              <SelectItem value="PURCHASED">Achetes</SelectItem>
              <SelectItem value="EARNED">Gagnes</SelectItem>
              <SelectItem value="BONUS">Bonus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Aucune transaction</p>
          </div>
        ) : (
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {filteredTransactions.map((tx) => {
              const config = transactionTypeLabels[tx.type] || { label: tx.type, isCredit: false }
              const isCredit = config.isCredit
              return (
                <div key={tx.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50">
                  {/* Icon */}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isCredit ? "bg-emerald-50" : "bg-red-50"}`}>
                    {isCredit ? (
                      <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">{config.label}</p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {walletLabels[tx.walletType]?.label || tx.walletType}
                      </Badge>
                      {tx.status !== "COMPLETED" && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {tx.status}
                        </Badge>
                      )}
                    </div>
                    {tx.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{tx.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                      {" · "}Solde: {tx.balanceBefore} → {tx.balanceAfter}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className={`text-right shrink-0 ${isCredit ? "text-emerald-600" : "text-red-500"}`}>
                    <p className="text-sm font-bold">
                      {isCredit ? "+" : "-"}{tx.amount}
                    </p>
                    <p className="text-xs text-slate-400">credits</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Credit/Debit Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {creditMode === "credit" ? "Crediter un wallet" : "Debiter un wallet"}
            </DialogTitle>
            <DialogDescription>
              {creditMode === "credit"
                ? "Ajouter des credits au wallet de l'utilisateur."
                : "Retirer des credits du wallet de l'utilisateur."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">Wallet</Label>
              <Select value={creditWalletType} onValueChange={setCreditWalletType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBSCRIPTION">Abonnement</SelectItem>
                  <SelectItem value="PURCHASED">Achetes</SelectItem>
                  <SelectItem value="EARNED">Gagnes</SelectItem>
                  <SelectItem value="BONUS">Bonus</SelectItem>
                </SelectContent>
              </Select>
              {creditMode === "debit" && (
                <p className="text-xs text-slate-500 mt-1">
                  Solde actuel : {wallets.find((w) => w.type === creditWalletType)?.balance ?? 0} credits
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm">Montant (credits)</Label>
              <Input
                type="number"
                min="1"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="10"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Description (optionnel)</Label>
              <Input
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                placeholder="Raison du credit/debit..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialogOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button
              onClick={handleCreditSubmit}
              disabled={!creditAmount || parseInt(creditAmount) <= 0 || isSubmitting}
              variant={creditMode === "debit" ? "destructive" : "default"}
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
              ) : creditMode === "credit" ? (
                <Plus className="h-4 w-4 mr-1.5" />
              ) : (
                <Minus className="h-4 w-4 mr-1.5" />
              )}
              {creditMode === "credit" ? "Crediter" : "Debiter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
