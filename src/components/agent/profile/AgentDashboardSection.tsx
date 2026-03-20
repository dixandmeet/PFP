"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Users,
  FileText,
  CheckCircle2,
  Eye,
  UserPlus,
  FilePlus,
  Video,
  UserCheck,
  Building2,
  Search,
  ArrowRight,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react"

interface AgentDashboardProps {
  userId: string
  agentProfileId: string
  agentProfile: {
    firstName: string
    lastName: string
    agencyName?: string
    bio?: string
    licenseNumber?: string
    licenseCountry?: string
    profilePicture?: string
    specialties?: string[]
  }
}

interface DashboardStats {
  mandatesCount: number
  reportsCount: number
  placementsCount: number
  profileViewsCount: number
  postsCount: number
  videosCount: number
}

function computeProfileCompletion(profile: AgentDashboardProps["agentProfile"]): {
  percentage: number
  missing: string[]
} {
  const checks: { field: boolean; label: string }[] = [
    { field: !!profile.firstName?.trim(), label: "Prénom" },
    { field: !!profile.lastName?.trim(), label: "Nom" },
    { field: !!profile.agencyName?.trim(), label: "Nom de l'agence" },
    { field: !!profile.bio?.trim(), label: "Bio" },
    { field: !!profile.licenseNumber?.trim(), label: "Numéro de licence" },
    { field: !!profile.licenseCountry?.trim(), label: "Pays de licence" },
    { field: !!profile.profilePicture, label: "Photo de profil" },
    { field: (profile.specialties?.length ?? 0) > 0, label: "Spécialités" },
  ]
  const done = checks.filter((c) => c.field).length
  const missing = checks.filter((c) => !c.field).map((c) => c.label)
  return { percentage: Math.round((done / checks.length) * 100), missing }
}

export function AgentDashboardSection({ userId, agentProfileId, agentProfile }: AgentDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      try {
        const [agentRes, postsRes, viewsRes] = await Promise.all([
          fetch(`/api/agents/${agentProfileId}`),
          fetch(`/api/posts?userId=${encodeURIComponent(userId)}&limit=50`),
          fetch(`/api/users/${userId}/profile-views?limit=1`),
        ])

        let mandatesCount = 0
        let submissionsCount = 0
        let reportsCount = 0
        if (agentRes.ok) {
          const data = await agentRes.json()
          mandatesCount = data.activeMandatesCount ?? 0
          submissionsCount = data.submissionsCount ?? 0
          reportsCount = data.reportsCount ?? 0
        }

        let postsCount = 0
        if (postsRes.ok) {
          const data = await postsRes.json()
          postsCount = Array.isArray(data.posts) ? data.posts.length : 0
        }

        let profileViewsCount = 0
        if (viewsRes.ok) {
          const data = await viewsRes.json()
          profileViewsCount = data.totalCount ?? data.views?.length ?? 0
        }

        if (!cancelled) {
          setStats({
            mandatesCount,
            reportsCount,
            placementsCount: submissionsCount,
            profileViewsCount,
            postsCount,
            videosCount: 0,
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadStats()
    return () => { cancelled = true }
  }, [userId, agentProfileId])

  const { percentage, missing } = computeProfileCompletion(agentProfile)

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
      </div>
    )
  }

  const perfItems = [
    { label: "Joueurs en mandat", value: stats?.mandatesCount ?? 0, icon: Users, color: "emerald" },
    { label: "Rapports créés", value: stats?.reportsCount ?? 0, icon: FileText, color: "emerald" },
    { label: "Joueurs placés", value: stats?.placementsCount ?? 0, icon: CheckCircle2, color: "emerald" },
    { label: "Vues du profil", value: stats?.profileViewsCount ?? 0, icon: Eye, color: "emerald" },
  ]

  // Build recommended actions
  const actions: { icon: typeof Users; label: string; description: string; href: string; ctaLabel: string; priority: "high" | "medium" }[] = []
  if (percentage < 100) {
    actions.push({
      icon: UserCheck,
      label: "Compléter mon profil",
      description: `Il manque : ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`,
      href: "/agent/profile/edit",
      ctaLabel: "Compléter",
      priority: "high",
    })
  }
  if ((stats?.mandatesCount ?? 0) === 0) {
    actions.push({
      icon: UserPlus,
      label: "Ajouter un joueur",
      description: "Signez votre premier mandat avec un joueur",
      href: "/agent/players",
      ctaLabel: "Ajouter",
      priority: "high",
    })
  }
  if ((stats?.reportsCount ?? 0) === 0) {
    actions.push({
      icon: FilePlus,
      label: "Créer un rapport",
      description: "Rédigez un rapport de scouting pour vos joueurs",
      href: "/agent/reports",
      ctaLabel: "Créer",
      priority: "medium",
    })
  }
  if ((stats?.videosCount ?? 0) === 0) {
    actions.push({
      icon: Video,
      label: "Ajouter une vidéo",
      description: "Publiez une vidéo pour mettre en avant vos joueurs",
      href: "/agent/dashboard",
      ctaLabel: "Ajouter",
      priority: "medium",
    })
  }

  const opportunities = [
    { icon: Building2, label: "Parcourir les offres clubs", description: "Découvrez les besoins des clubs", href: "/agent/opportunities" },
    { icon: Search, label: "Rechercher des joueurs", description: "Trouvez des talents disponibles", href: "/agent/search" },
    { icon: TrendingUp, label: "Voir les recherches actives", description: "Consultez les demandes en cours", href: "/agent/opportunities" },
  ]

  return (
    <div className="space-y-5">
      {/* Performances */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-5 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          Mes performances
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {perfItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center rounded-xl border border-emerald-100 bg-white p-4 text-center shadow-sm"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <item.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{item.value}</span>
              <span className="mt-1 text-xs text-gray-500 leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Profile progress + Actions recommandées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Barre de progression du profil */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50/80 to-white p-5 shadow-sm"
        >
          <h2 className="mb-3 text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Complétion du profil
          </h2>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{percentage}%</span>
            <span className="text-xs text-gray-500">
              {percentage === 100 ? "Profil complet !" : `${missing.length} élément${missing.length > 1 ? "s" : ""} manquant${missing.length > 1 ? "s" : ""}`}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                percentage === 100
                  ? "bg-emerald-500"
                  : percentage >= 60
                    ? "bg-orange-400"
                    : "bg-orange-500"
              }`}
            />
          </div>
          <p className="mt-3 text-sm text-gray-600">
            {percentage === 100
              ? "Votre profil est complet. Les clubs vous trouvent plus facilement !"
              : percentage >= 60
                ? "Encore un petit effort ! Un profil complet augmente votre visibilité."
                : "Complétez votre profil pour apparaître dans les recherches des clubs."}
          </p>
          {percentage < 100 && (
            <Link href="/agent/profile/edit">
              <Button size="sm" className="mt-3 h-9 rounded-lg bg-orange-500 hover:bg-orange-600 text-white">
                Compléter mon profil
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Actions recommandées */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-5 shadow-sm"
        >
          <h2 className="mb-3 text-lg font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Actions recommandées
          </h2>
          {actions.length === 0 ? (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Tout est en ordre !</p>
              <p className="text-xs text-gray-500">Continuez à développer votre activité.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {actions.map((action) => (
                <div
                  key={action.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        action.priority === "high"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{action.label}</p>
                      <p className="truncate text-xs text-gray-500">{action.description}</p>
                    </div>
                  </div>
                  <Link href={action.href}>
                    <Button
                      size="sm"
                      className={`h-8 shrink-0 rounded-lg ${
                        action.priority === "high"
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      } text-white`}
                    >
                      {action.ctaLabel}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Opportunités */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-emerald-600" />
          Opportunités
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {opportunities.map((opp) => (
            <Link key={opp.label} href={opp.href}>
              <div className="group flex flex-col items-center rounded-xl border border-gray-100 bg-gradient-to-b from-gray-50 to-white p-4 text-center transition-all hover:border-emerald-200 hover:shadow-md">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 transition-colors group-hover:bg-emerald-200">
                  <opp.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">{opp.label}</p>
                <p className="mt-1 text-xs text-gray-500">{opp.description}</p>
                <span className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Explorer <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
