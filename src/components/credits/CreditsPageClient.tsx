"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletOverview } from "@/components/credits/WalletOverview"
import { TransactionList } from "@/components/credits/TransactionList"
import { TopUpForm } from "@/components/credits/TopUpForm"
import { WithdrawalPanel } from "@/components/credits/WithdrawalPanel"
import { SubscriptionManager } from "@/components/credits/SubscriptionManager"
import { PlayerGamificationPanel } from "@/components/credits/PlayerGamificationPanel"
import {
  Wallet,
  History,
  CreditCard,
  Banknote,
  Crown,
  ChevronRight,
  Film,
} from "lucide-react"

interface CreditsPageClientProps {
  defaultTab?: string
  /** Progression / quotas vidéo + lignes « stockage & uploads » sur les plans */
  showPlayerGamification?: boolean
}

interface WalletData {
  subscription: number
  purchased: number
  earned: number
  bonus: number
  totalBalance: number
  plan: string | null
  planStatus: string | null
}

export function CreditsPageClient({
  defaultTab = "overview",
  showPlayerGamification = false,
}: CreditsPageClientProps) {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const syncDoneRef = useRef(false)

  async function fetchWallets() {
    try {
      const res = await fetch("/api/credits/wallets")
      if (res.ok) {
        const data = await res.json()
        setWalletData({
          subscription: data.wallets.subscription,
          purchased: data.wallets.purchased,
          earned: data.wallets.earned,
          bonus: data.wallets.bonus,
          totalBalance: data.totalBalance,
          plan: data.plan,
          planStatus: data.planStatus,
        })
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallets()
  }, [])

  // Après retour Stripe : synchroniser l'abonnement si le webhook n'a pas été reçu (ex. dev sans Stripe CLI)
  useEffect(() => {
    const success = searchParams.get("success")
    const sessionId = searchParams.get("session_id")
    if (success !== "true" || !sessionId || syncDoneRef.current) return

    syncDoneRef.current = true
    fetch("/api/credits/subscription/sync-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          console.error("[Credits] Sync abonnement échoué:", res.status, err)
        }
        return res
      })
      .finally(() => {
        fetchWallets()
        router.replace(pathname || "/player/credits", { scroll: false })
      })
  }, [searchParams, router, pathname])

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pitch-100 rounded-xl">
              <Wallet className="h-6 w-6 text-pitch-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stadium-900">Mes Crédits</h1>
              <p className="text-sm text-stadium-500">
                {showPlayerGamification
                  ? "Crédits, abonnement, stockage vidéo et progression"
                  : "Gérez vos crédits et abonnements"}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="bg-stadium-100 p-1 rounded-xl w-full sm:w-auto flex">
            <TabsTrigger value="overview" className="rounded-lg text-sm gap-1.5 flex-1 sm:flex-none">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Aperçu</span>
            </TabsTrigger>
            <TabsTrigger value="topup" className="rounded-lg text-sm gap-1.5 flex-1 sm:flex-none">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Recharger</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="rounded-lg text-sm gap-1.5 flex-1 sm:flex-none">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Abonnement</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="rounded-lg text-sm gap-1.5 flex-1 sm:flex-none">
              <Banknote className="h-4 w-4" />
              <span className="hidden sm:inline">Retraits</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg text-sm gap-1.5 flex-1 sm:flex-none">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historique</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <WalletOverview
                data={walletData}
                loading={loading}
                playerHint={showPlayerGamification}
              />

              {showPlayerGamification && <PlayerGamificationPanel />}

              <div
                className={`grid grid-cols-1 gap-3 ${showPlayerGamification ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}
              >
                <QuickAction
                  icon={CreditCard}
                  title="Recharger"
                  description="Acheter des crédits"
                  color="pitch"
                  tab="topup"
                />
                <QuickAction
                  icon={Crown}
                  title="Abonnement"
                  description="Gérer mon plan"
                  color="gold"
                  tab="subscription"
                />
                <QuickAction
                  icon={Banknote}
                  title="Retirer"
                  description="Convertir en argent"
                  color="victory"
                  tab="withdrawals"
                />
                {showPlayerGamification && (
                  <Link
                    href="/reels"
                    className="bg-pitch-50 hover:bg-pitch-100 p-4 rounded-xl transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-pitch-100 text-pitch-600">
                        <Film className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-pitch-700">Reels & vidéos</p>
                        <p className="text-xs text-stadium-500">Uploader pour gagner des crédits bonus</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-stadium-300 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-stadium-700">Transactions récentes</h2>
                </div>
                <TransactionList compact limit={5} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="topup">
            <div className="max-w-lg mx-auto">
              <Card className="border border-stadium-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-pitch-100 rounded-lg">
                      <CreditCard className="h-5 w-5 text-pitch-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-stadium-800">Recharger mes crédits</h2>
                      <p className="text-xs text-stadium-500">Paiement sécurisé via Stripe</p>
                    </div>
                  </div>
                  <TopUpForm />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionManager playerPlanDetails={showPlayerGamification} />
          </TabsContent>

          <TabsContent value="withdrawals">
            <div className="max-w-2xl mx-auto">
              <WithdrawalPanel earnedBalance={walletData?.earned || 0} />
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="border border-stadium-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-stadium-100 rounded-lg">
                    <History className="h-5 w-5 text-stadium-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-stadium-800">Historique des transactions</h2>
                    <p className="text-xs text-stadium-500">Tous vos mouvements de crédits</p>
                  </div>
                </div>
                <TransactionList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function QuickAction({
  icon: Icon,
  title,
  description,
  color,
  tab,
}: {
  icon: typeof CreditCard
  title: string
  description: string
  color: "pitch" | "gold" | "victory"
  tab: string
}) {
  const colorMap = {
    pitch: { bg: "bg-pitch-50 hover:bg-pitch-100", icon: "bg-pitch-100 text-pitch-600", text: "text-pitch-700" },
    gold: { bg: "bg-gold-50 hover:bg-gold-100", icon: "bg-gold-100 text-gold-600", text: "text-gold-700" },
    victory: { bg: "bg-victory-50 hover:bg-victory-100", icon: "bg-victory-100 text-victory-600", text: "text-victory-700" },
  }
  const styles = colorMap[color]

  return (
    <button
      onClick={() => {
        const trigger = document.querySelector(`[data-state][value="${tab}"]`) as HTMLElement
        trigger?.click()
      }}
      className={`${styles.bg} p-4 rounded-xl transition-colors text-left group cursor-pointer`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${styles.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${styles.text}`}>{title}</p>
          <p className="text-xs text-stadium-500">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-stadium-300 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  )
}
