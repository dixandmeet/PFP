"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Crown,
  Check,
  Loader2,
  Rocket,
  Users,
  Zap,
  Star,
  XCircle,
  ChevronDown,
  Shield,
  Headphones,
  BarChart3,
  Target,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Subscription {
  id: string
  plan: string
  status: string
  currentPeriodEnd: string | null
}

interface PlanTheme {
  accent: string
  accentLight: string
  accentBorder: string
  accentText: string
  accentBg: string
  gradient: string
  glowColor: string
  buttonBg: string
  buttonHover: string
}

interface Plan {
  id: string
  name: string
  priceMonthly: number
  creditsMonthly: number
  redistributionPct: number
  analyticsLevel: string
  supportLevel: string
  isPopular: boolean
  isCurrent: boolean
  icon: typeof Users
  theme: PlanTheme
  benefits: string[]
  features: string[]
}

// ─── Plans Data ──────────────────────────────────────────────────────────────

const basePlans: Omit<Plan, "isCurrent">[] = [
  {
    id: "FREE",
    name: "Gratuit",
    priceMonthly: 0,
    creditsMonthly: 0,
    redistributionPct: 0,
    analyticsLevel: "—",
    supportLevel: "Communauté",
    isPopular: false,
    icon: Users,
    theme: {
      accent: "border-stadium-300",
      accentLight: "bg-stadium-50",
      accentBorder: "border-stadium-300",
      accentText: "text-stadium-700",
      accentBg: "bg-stadium-100",
      gradient: "from-stadium-50 to-stadium-100",
      glowColor: "",
      buttonBg: "bg-stadium-100 border-2 border-stadium-300 text-stadium-800",
      buttonHover: "hover:border-stadium-400",
    },
    benefits: [
      "Accès à la plateforme",
      "Profil visible sans crédits inclus",
    ],
    features: [
      "0 crédit/mois inclus",
      "Recharge possible à l'unité",
    ],
  },
  {
    id: "STARTER",
    name: "Starter",
    priceMonthly: 10,
    creditsMonthly: 10,
    redistributionPct: 25,
    analyticsLevel: "Basique",
    supportLevel: "Email",
    isPopular: false,
    icon: Users,
    theme: {
      accent: "border-stadium-300",
      accentLight: "bg-stadium-50",
      accentBorder: "border-stadium-300",
      accentText: "text-stadium-600",
      accentBg: "bg-stadium-100",
      gradient: "from-stadium-100 to-stadium-200",
      glowColor: "",
      buttonBg: "bg-stadium-700 hover:bg-stadium-800 text-white",
      buttonHover: "hover:border-stadium-400",
    },
    benefits: [
      "Lancez votre visibilité football",
      "Premiers contacts avec les clubs",
    ],
    features: [
      "10 crédits/mois",
      "Redistribution 25%",
    ],
  },
  {
    id: "GROWTH",
    name: "Growth",
    priceMonthly: 50,
    creditsMonthly: 50,
    redistributionPct: 30,
    analyticsLevel: "Analytics de base",
    supportLevel: "Email prioritaire",
    isPopular: true,
    icon: Rocket,
    theme: {
      accent: "border-pitch-400",
      accentLight: "bg-pitch-50",
      accentBorder: "border-pitch-400",
      accentText: "text-pitch-700",
      accentBg: "bg-pitch-100",
      gradient: "from-pitch-50 to-pitch-100",
      glowColor: "shadow-pitch-200/50",
      buttonBg: "bg-pitch-600 hover:bg-pitch-700",
      buttonHover: "hover:border-pitch-500",
    },
    benefits: [
      "Multipliez vos opportunités de recrutement",
      "Suivez vos performances avec les analytics",
    ],
    features: [
      "50 crédits/mois",
      "Redistribution 30%",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    priceMonthly: 200,
    creditsMonthly: 200,
    redistributionPct: 40,
    analyticsLevel: "Analytics avancés",
    supportLevel: "Support prioritaire",
    isPopular: false,
    icon: Zap,
    theme: {
      accent: "border-blue-400",
      accentLight: "bg-blue-50",
      accentBorder: "border-blue-400",
      accentText: "text-blue-700",
      accentBg: "bg-blue-100",
      gradient: "from-blue-50 to-blue-100",
      glowColor: "shadow-blue-200/50",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
      buttonHover: "hover:border-blue-500",
    },
    benefits: [
      "Accès complet aux analytics avancés",
      "Support prioritaire pour vos démarches",
    ],
    features: [
      "200 crédits/mois",
      "Redistribution 40%",
    ],
  },
  {
    id: "ELITE",
    name: "Elite",
    priceMonthly: 500,
    creditsMonthly: 500,
    redistributionPct: 50,
    analyticsLevel: "Tout illimité",
    supportLevel: "Manager dédié",
    isPopular: false,
    icon: Crown,
    theme: {
      accent: "border-amber-400",
      accentLight: "bg-amber-50",
      accentBorder: "border-amber-400",
      accentText: "text-amber-700",
      accentBg: "bg-amber-100",
      gradient: "from-amber-50 to-orange-50",
      glowColor: "shadow-amber-200/60",
      buttonBg: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
      buttonHover: "hover:border-amber-500",
    },
    benefits: [
      "Accompagnement premium avec manager dédié",
      "Visibilité et accès illimités",
    ],
    features: [
      "500 crédits/mois",
      "Redistribution 50%",
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcPricePerDay(priceMonthly: number): string {
  return (Math.round((priceMonthly / 30) * 10) / 10).toFixed(1)
}

function onSelectPlan(planId: string) {
  
}

// ─── PlanCard ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  isActive,
  currentPlan,
  actionLoading,
  onSubscribe,
  onChangePlan,
  compact = false,
}: {
  plan: Plan
  isActive: boolean
  currentPlan: string | null
  actionLoading: string | null
  onSubscribe: (id: string) => void
  onChangePlan: (id: string) => void
  compact?: boolean
}) {
  const Icon = plan.icon
  const isCurrent = plan.isCurrent
  const isRecommended = plan.isPopular && !isCurrent
  const isStarter = plan.id === "STARTER"
  const isFree = plan.id === "FREE"
  const currentPlanIsPaid = currentPlan != null && currentPlan !== "FREE"

  const pricePerDay = calcPricePerDay(plan.priceMonthly)

  const featureIcons = [Target, BarChart3, Headphones]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative flex flex-col rounded-2xl border-2 bg-white transition-all duration-300",
        isCurrent && "scale-[1.03] z-10 border-3 shadow-lg",
        isCurrent && plan.theme.accent,
        isCurrent && plan.theme.glowColor && `shadow-xl ${plan.theme.glowColor}`,
        isRecommended && !isCurrent && "border-pitch-300 shadow-md",
        !isCurrent && !isRecommended && plan.theme.accentBorder,
        !isCurrent && "hover:-translate-y-1 hover:shadow-lg",
        !isCurrent && plan.theme.buttonHover,
        isStarter && !isCurrent && "opacity-90",
        isCurrent && "p-0",
      )}
    >
      {isCurrent && (
        <div className={cn(
          "flex items-center justify-center rounded-t-xl font-bold text-white",
          compact ? "gap-1 py-1 text-[10px]" : "gap-1.5 py-1.5 text-xs",
          "bg-gradient-to-r",
          plan.id === "ELITE" ? "from-amber-500 to-orange-500" :
          plan.id === "PRO" ? "from-blue-500 to-blue-600" :
          plan.id === "GROWTH" ? "from-pitch-500 to-pitch-600" :
          plan.id === "FREE" ? "from-stadium-400 to-stadium-500" :
          "from-stadium-500 to-stadium-600"
        )}>
          <Shield className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
          Plan actuel
        </div>
      )}

      {isRecommended && (
        <div className={cn(
          "flex items-center justify-center rounded-t-xl text-xs font-bold text-white bg-gradient-to-r from-pitch-500 to-emerald-500",
          compact ? "gap-1 py-1 text-[10px]" : "gap-1.5 py-1.5"
        )}>
          <Crown className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
          Recommandé
        </div>
      )}

      {plan.isPopular && !isRecommended && !isCurrent && (
        <div className={cn(
          "flex items-center justify-center rounded-t-xl text-xs font-bold text-pitch-700 bg-pitch-100",
          compact ? "gap-1 py-1 text-[10px]" : "gap-1.5 py-1.5"
        )}>
          <Star className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
          Populaire
        </div>
      )}

      <div className={cn(
        "flex flex-col flex-1 min-w-0",
        compact ? "p-3" : isCurrent ? "p-7" : "p-6"
      )}>
        {/* Header */}
        <div className={cn("flex items-center justify-between", compact ? "mb-2" : "mb-4")}>
          <div className={cn("flex items-center gap-2", compact && "gap-1.5")}>
            <div className={cn(plan.theme.accentBg, "rounded-xl", compact ? "p-1.5" : "p-2")}>
              <Icon className={cn(plan.theme.accentText, compact ? "h-4 w-4" : "h-5 w-5")} />
            </div>
            <h3 className={cn("font-bold text-stadium-900", compact ? "text-sm" : "text-lg")}>
              {plan.name}
            </h3>
          </div>
        </div>

        {/* Prix */}
        <div className={compact ? "mb-0.5" : "mb-1"}>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className={cn("font-extrabold tracking-tight", plan.theme.accentText, compact ? "text-lg" : "text-3xl")}>
              {plan.priceMonthly === 0 ? "Gratuit" : `${plan.priceMonthly} €`}
            </span>
            {plan.priceMonthly > 0 && <span className={cn("text-stadium-400 font-medium", compact ? "text-xs" : "text-sm")}>/mois</span>}
          </div>
          <p className={cn("text-stadium-400", compact ? "text-[10px] mt-0" : "text-xs mt-0.5")}>
            {plan.priceMonthly === 0
              ? "Recharge à l'unité"
              : `${plan.creditsMonthly} cr./mois`}
          </p>
        </div>

        {/* Separator */}
        <div className={cn("h-px", plan.theme.accentBg, compact ? "my-2" : "my-4")} />

        {/* Benefits + Features */}
        <ul className={cn("flex-1", compact ? "space-y-1 mb-3" : "space-y-2.5 mb-6")}>
          {plan.benefits.map((b, i) => (
            <li key={`b-${i}`} className={cn("flex items-start gap-1.5 text-stadium-700", compact ? "text-xs" : "gap-2.5 text-sm")}>
              <div className={cn("mt-0.5 p-0.5 rounded-full flex-shrink-0", plan.theme.accentBg)}>
                <Check className={cn(plan.theme.accentText, compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
              </div>
              <span className={cn(compact && "font-medium")}>{b}</span>
            </li>
          ))}
          {plan.features.map((f, i) => (
            <li key={`f-${i}`} className={cn("flex items-start gap-1.5 text-stadium-500", compact ? "text-[10px]" : "gap-2.5 text-sm")}>
              <div className="mt-0.5 p-0.5 rounded-full flex-shrink-0 bg-stadium-100">
                {(() => {
                  const FIcon = featureIcons[i % featureIcons.length]
                  return <FIcon className={cn("text-stadium-400", compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
                })()}
              </div>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        {isCurrent ? (
          <button
            disabled
            className={cn(
              "w-full rounded-xl font-semibold cursor-not-allowed",
              plan.theme.accentBg, plan.theme.accentText,
              "border", plan.theme.accentBorder,
              compact ? "py-1.5 text-xs" : "py-2.5 text-sm"
            )}
            aria-label={`${plan.name} est votre plan actuel`}
          >
            Plan actuel
          </button>
        ) : (
          <div className={compact ? "space-y-1" : "space-y-2"}>
            <Button
              onClick={() => {
                if (isFree) return // Pas de checkout pour le plan gratuit
                onSelectPlan(plan.id)
                if (isActive && currentPlanIsPaid) {
                  onChangePlan(plan.id)
                } else {
                  onSubscribe(plan.id)
                }
              }}
              disabled={actionLoading === plan.id || isFree}
              className={cn(
                "w-full rounded-xl font-bold transition-all cursor-default",
                plan.theme.buttonBg,
                !isFree && "text-white",
                "focus-visible:ring-2 focus-visible:ring-offset-2",
                compact ? "py-1.5 text-xs" : "py-2.5 text-sm"
              )}
              aria-label={isFree ? "Formule gratuite par défaut" : `${isActive ? "Passer à" : "Activer"} ${plan.name}`}
            >
              {actionLoading === plan.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isFree ? (
                "Formule actuelle"
              ) : (
                <>
                  {isActive ? `Passer à ${plan.name}` : `Activer ${plan.name}`}
                </>
              )}
            </Button>
            {!isFree && !compact && (
              <p className="text-[11px] text-stadium-400 text-center">
                Annulation à tout moment
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── PlanComparison ──────────────────────────────────────────────────────────

function PlanComparison({ plans }: { plans: Plan[] }) {
  const [isOpen, setIsOpen] = useState(false)

  const rows: { label: string; key: keyof Plan; format: (v: any) => string }[] = [
    { label: "Prix / mois", key: "priceMonthly", format: (v) => `${v} €` },
    { label: "Crédits / mois", key: "creditsMonthly", format: (v) => `${v} crédits` },
    { label: "Redistribution", key: "redistributionPct", format: (v) => `${v}%` },
    { label: "Analytics", key: "analyticsLevel", format: (v) => v },
    { label: "Support", key: "supportLevel", format: (v) => v },
  ]

  return (
    <div className="mt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 mx-auto text-sm font-medium text-stadium-500 hover:text-stadium-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500 rounded-lg px-4 py-2"
        aria-expanded={isOpen}
        aria-controls="plan-comparison-table"
      >
        <BarChart3 className="h-4 w-4" />
        Comparer les plans
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          id="plan-comparison-table"
          className="mt-4 overflow-x-auto rounded-2xl border border-stadium-200 bg-white shadow-sm"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stadium-100">
                <th className="text-left p-4 text-stadium-500 font-medium w-1/5" />
                {plans.map((plan) => {
                  const Icon = plan.icon
                  return (
                    <th
                      key={plan.id}
                      className={cn(
                        "p-4 text-center font-bold",
                        plan.isCurrent ? plan.theme.accentText : "text-stadium-800"
                      )}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Icon className="h-4 w-4" />
                        {plan.name}
                      </div>
                      {plan.isCurrent && (
                        <span className="text-[10px] font-medium opacity-70">Actuel</span>
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.key}
                  className={cn(
                    "border-b border-stadium-50",
                    idx % 2 === 0 ? "bg-white" : "bg-stadium-50/50"
                  )}
                >
                  <td className="p-4 text-stadium-500 font-medium">{row.label}</td>
                  {plans.map((plan) => (
                    <td
                      key={plan.id}
                      className={cn(
                        "p-4 text-center font-medium",
                        plan.isCurrent ? plan.theme.accentText + " font-bold" : "text-stadium-700"
                      )}
                    >
                      {row.format(plan[row.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SubscriptionManager() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch("/api/credits/subscription")
        if (res.ok) {
          const data = await res.json()
          setSubscription(data.subscription)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  const handleSubscribe = async (planId: string) => {
    setError(null)
    setActionLoading(planId)
    try {
      const res = await fetch("/api/credits/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, returnUrl: window.location.origin + window.location.pathname }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.sessionUrl) {
        window.location.href = data.sessionUrl
        return
      }
      setError(data.error || "Impossible de lancer l'activation. Réessayez ou contactez le support.")
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleChangePlan = async (planId: string) => {
    setError(null)
    setActionLoading(planId)
    try {
      const res = await fetch("/api/credits/subscription/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.subscription) {
        setSubscription(data.subscription)
        return
      }
      setError(data.error || "Impossible de changer de plan.")
    } catch {
      setError("Erreur réseau. Réessayez.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async () => {
    setActionLoading("cancel")
    try {
      const res = await fetch("/api/credits/subscription/cancel", {
        method: "POST",
      })
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
      }
    } catch {
      // handle error
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-stadium-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-stadium-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const currentPlan = subscription?.plan
  const isActive = subscription?.status === "ACTIVE"

  const plans: Plan[] = basePlans.map((p) => ({
    ...p,
    isCurrent: currentPlan === p.id && isActive,
  }))

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-gold-100 rounded-xl">
          <Crown className="h-5 w-5 text-gold-600" />
        </div>
        <div>
          <h2 className="font-semibold text-stadium-800 text-lg">Plans d&apos;abonnement</h2>
          <p className="text-xs text-stadium-500">Facturation mensuelle · 1 crédit = 1 €</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 flex items-center gap-2">
          <XCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Active subscription banner */}
      {subscription && isActive && (
        <Card className="border-2 border-pitch-200 bg-gradient-to-r from-pitch-50 to-emerald-50 overflow-hidden">
        <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pitch-100 rounded-xl">
              <Star className="h-5 w-5 text-pitch-600" />
            </div>
            <div>
              <p className="font-bold text-stadium-800">Plan {currentPlan} actif</p>
              {subscription.currentPeriodEnd && currentPlan !== "FREE" && (
                <p className="text-xs text-stadium-500">
                  Prochain renouvellement : {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
          </div>
          {currentPlan !== "FREE" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={actionLoading === "cancel"}
              className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl"
            >
              {actionLoading === "cancel" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-1" />
                  Annuler
                </>
              )}
            </Button>
          )}
        </div>
        </CardContent>
        </Card>
      )}

      {/* Plans — toutes les formules sur une ligne (grand écran), sans scroll */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full min-w-0">
        {plans.map((plan) => (
          <div key={plan.id} className="min-w-0">
            <PlanCard
              plan={plan}
              isActive={isActive ?? false}
              currentPlan={currentPlan ?? null}
              actionLoading={actionLoading}
              onSubscribe={handleSubscribe}
              onChangePlan={handleChangePlan}
              compact
            />
          </div>
        ))}
      </div>

      {/* Plan Comparison */}
      <PlanComparison plans={plans} />
    </div>
  )
}
