"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { StatsCard } from "@/components/admin/StatsCard"
import { Card } from "@/components/ui/card"
import {
  Users,
  FileText,
  Briefcase,
  TrendingUp,
  Activity,
  Calendar,
  Globe,
  Building2,
} from "lucide-react"

interface ReportStats {
  users: {
    total: number
    byRole: {
      players: number
      agents: number
      clubs: number
      admins: number
    }
    newLast7Days: number
    newLast30Days: number
    growth: number
  }
  content: {
    totalPosts: number
    postsLast7Days: number
    totalComments: number
  }
  listings: {
    total: number
    active: number
    closed: number
  }
  applications: {
    total: number
    pending: number
  }
  submissions: {
    total: number
  }
  audit: {
    total: number
    last7Days: number
  }
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
      </div>
    )
  }

  return (
    <div>
      <AdminHeader
        title="Rapports & Statistiques"
        description="Vue complète des métriques de la plateforme"
      />

      <div className="p-4 lg:p-6 space-y-8">
        {/* User Statistics */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Utilisateurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total utilisateurs"
              value={stats?.users.total || 0}
              icon={Users}
              trend={stats?.users.growth ? { value: stats.users.growth, isPositive: stats.users.growth > 0 } : undefined}
              description="vs semaine dernière"
            />
            <StatsCard
              title="Joueurs"
              value={stats?.users.byRole.players || 0}
              description={`${Math.round(((stats?.users.byRole.players || 0) / (stats?.users.total || 1)) * 100)}% du total`}
              className="border-l-4 border-l-blue-500"
            />
            <StatsCard
              title="Agents"
              value={stats?.users.byRole.agents || 0}
              description={`${Math.round(((stats?.users.byRole.agents || 0) / (stats?.users.total || 1)) * 100)}% du total`}
              className="border-l-4 border-l-purple-500"
            />
            <StatsCard
              title="Clubs"
              value={stats?.users.byRole.clubs || 0}
              description={`${Math.round(((stats?.users.byRole.clubs || 0) / (stats?.users.total || 1)) * 100)}% du total`}
              className="border-l-4 border-l-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Nouveaux (7 jours)</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-1">
                    {stats?.users.newLast7Days || 0}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-slate-200" />
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Nouveaux (30 jours)</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-1">
                    {stats?.users.newLast30Days || 0}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-slate-200" />
              </div>
            </Card>
          </div>
        </section>

        {/* Content Statistics */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contenu
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              title="Total posts"
              value={stats?.content.totalPosts || 0}
              icon={FileText}
            />
            <StatsCard
              title="Posts (7 jours)"
              value={stats?.content.postsLast7Days || 0}
              description={`${Math.round(((stats?.content.postsLast7Days || 0) / 7))} par jour en moyenne`}
            />
            <StatsCard
              title="Commentaires"
              value={stats?.content.totalComments || 0}
              description={`${((stats?.content.totalComments || 0) / (stats?.content.totalPosts || 1)).toFixed(1)} par post en moyenne`}
            />
          </div>
        </section>

        {/* Business Statistics */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Activité commerciale
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Annonces total"
              value={stats?.listings.total || 0}
              icon={Briefcase}
            />
            <StatsCard
              title="Annonces actives"
              value={stats?.listings.active || 0}
              className="border-l-4 border-l-emerald-500"
            />
            <StatsCard
              title="Candidatures"
              value={stats?.applications.total || 0}
              description={`${stats?.applications.pending || 0} en attente`}
            />
            <StatsCard
              title="Soumissions agents"
              value={stats?.submissions.total || 0}
            />
          </div>

          {/* Conversion metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Card className="p-5">
              <p className="text-sm font-medium text-slate-500">Taux de candidature</p>
              <p className="text-3xl font-semibold text-slate-900 mt-1">
                {stats?.listings.active && stats.applications.total
                  ? ((stats.applications.total / stats.listings.active)).toFixed(1)
                  : "0"
                }
              </p>
              <p className="text-xs text-slate-500 mt-1">candidatures par annonce active</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-medium text-slate-500">Taux de complétion</p>
              <p className="text-3xl font-semibold text-slate-900 mt-1">
                {stats?.listings.total && stats.listings.closed
                  ? Math.round((stats.listings.closed / stats.listings.total) * 100)
                  : "0"
                }%
              </p>
              <p className="text-xs text-slate-500 mt-1">annonces clôturées</p>
            </Card>
          </div>
        </section>

        {/* Platform Activity */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activité plateforme
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatsCard
              title="Actions enregistrées"
              value={stats?.audit.total || 0}
              icon={Activity}
              description="Total historique"
            />
            <StatsCard
              title="Actions (7 jours)"
              value={stats?.audit.last7Days || 0}
              description={`${Math.round((stats?.audit.last7Days || 0) / 7)} par jour`}
            />
          </div>
        </section>

        {/* Export notice */}
        <Card className="p-6 bg-slate-50 border-dashed">
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Les exports de données détaillées seront disponibles prochainement.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Contactez l'équipe technique pour des rapports personnalisés.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
