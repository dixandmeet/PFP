"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { StatsCard } from "@/components/admin/StatsCard"
import { UserBadge } from "@/components/admin/UserBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  FileText,
  Briefcase,
  Activity,
  UserPlus,
  ClipboardList,
  Send,
  MessageSquare,
  UserRound,
  MessageSquareText,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Stats {
  users: {
    total: number
    byRole: {
      players: number
      agents: number
      clubs: number
      admins: number
    }
    newLast7Days: number
    growth: number
    signupChart: Array<{ date: string; count: number }>
    recent: Array<{
      id: string
      name: string
      email: string
      role: string
      createdAt: string
      image: string
    }>
  }
  content: {
    totalPosts: number
    postsLast7Days: number
    totalComments: number
    recentPosts: Array<{
      id: string
      content: string
      createdAt: string
      user: { id: string; name: string; image: string }
      _count: { likes: number; comments: number }
    }>
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
    recentAI: Array<{
      id: string
      action: string
      createdAt: string
      user: { id: string; name: string; email: string }
    }>
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[20px] font-semibold text-slate-800 tracking-tight">
      {children}
    </h2>
  )
}

function EmptyState({
  icon: Icon,
  message,
  actionLabel,
  actionHref,
}: {
  icon: React.ElementType
  message: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-slate-300" />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-2 text-sm font-medium text-pitch-600 hover:text-pitch-700 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

function FeedCard({
  title,
  href,
  children,
}: {
  title: string
  href: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-slate-800">{title}</h3>
        <Link
          href={href}
          className="text-xs font-medium text-slate-400 hover:text-pitch-600 transition-colors"
        >
          Voir tout
        </Link>
      </div>
      {children}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/stats", {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Erreur ${res.status}: ${res.statusText}`
        )
      }
      const data = await res.json()
      setStats(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur inconnue"
      console.error("Error fetching stats:", err)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <AdminHeader
          title="Dashboard"
          description="Vue d'ensemble de la plateforme"
        />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
            <Activity className="h-6 w-6 text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-800">
              Impossible de charger les statistiques
            </p>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchStats}
            className="mt-2 px-4 py-2 text-sm font-medium text-white bg-pitch-600 rounded-lg hover:bg-pitch-700 transition-colors"
          >
            Reessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        description="Vue d'ensemble de la plateforme"
      />

      <div className="p-4 lg:p-8 space-y-8 max-w-[1400px]">
        {/* ── Section 1: Top KPIs ── */}
        <section>
          <SectionTitle>Vue d&apos;ensemble</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
            <StatsCard
              variant="kpi"
              title="Utilisateurs"
              value={stats?.users.total || 0}
              icon={Users}
              trend={
                stats?.users.growth
                  ? {
                      value: stats.users.growth,
                      isPositive: stats.users.growth > 0,
                    }
                  : undefined
              }
              description="vs semaine derniere"
            />
            <StatsCard
              variant="kpi"
              title="Nouveaux (7j)"
              value={stats?.users.newLast7Days || 0}
              icon={UserPlus}
            />
            <StatsCard
              variant="kpi"
              title="Posts actifs"
              value={stats?.content.totalPosts || 0}
              icon={FileText}
              description={`${stats?.content.postsLast7Days || 0} cette semaine`}
            />
            <StatsCard
              variant="kpi"
              title="Listings actifs"
              value={stats?.listings.active || 0}
              icon={Briefcase}
              description={`${stats?.listings.total || 0} au total`}
            />
          </div>
        </section>

        {/* ── Section 2: Roles Breakdown ── */}
        <section>
          <SectionTitle>Repartition par role</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
            <StatsCard
              variant="role"
              title="Joueurs"
              value={stats?.users.byRole.players || 0}
              accentColor="#3b82f6"
            />
            <StatsCard
              variant="role"
              title="Agents"
              value={stats?.users.byRole.agents || 0}
              accentColor="#a855f7"
            />
            <StatsCard
              variant="role"
              title="Clubs"
              value={stats?.users.byRole.clubs || 0}
              accentColor="#22c55e"
            />
            <StatsCard
              variant="role"
              title="Admins"
              value={stats?.users.byRole.admins || 0}
              accentColor="#64748b"
            />
          </div>
          <div className="mt-3">
            <Link
              href="/admin/users?role=PLAYER,AGENT"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-pitch-700 bg-pitch-50 rounded-lg hover:bg-pitch-100 transition-colors"
            >
              <Users className="h-4 w-4" />
              Voir tous les joueurs & agents
            </Link>
          </div>
        </section>

        {/* ── Section 3: Moderation & Activity ── */}
        <section>
          <SectionTitle>Moderation & Activite</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <StatsCard
              title="Candidatures en attente"
              value={stats?.applications.pending || 0}
              icon={ClipboardList}
              description={`${stats?.applications.total || 0} au total`}
            />
            <StatsCard
              title="Soumissions"
              value={stats?.submissions.total || 0}
              icon={Send}
            />
            <StatsCard
              title="Actions automatisées"
              value={stats?.audit.last7Days || 0}
              icon={MessageSquare}
              description="7 derniers jours"
              className="ring-1 ring-violet-100 bg-violet-50/30"
            />
          </div>
        </section>

        {/* ── Section 4: Recent Activity Feeds ── */}
        <section>
          <SectionTitle>Activite recente</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
            {/* Recent Users */}
            <FeedCard title="Derniers inscrits" href="/admin/users">
              {stats?.users.recent && stats.users.recent.length > 0 ? (
                <div className="space-y-1">
                  {stats.users.recent.map((user) => (
                    <Link
                      key={user.id}
                      href={`/admin/users/${user.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="text-xs bg-slate-100 text-slate-400">
                          {user.name?.charAt(0) || user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {user.name || user.email}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatDistanceToNow(new Date(user.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>
                      <UserBadge role={user.role as any} />
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={UserRound}
                  message="Aucun utilisateur recent"
                  actionLabel="Gerer les utilisateurs"
                  actionHref="/admin/users"
                />
              )}
            </FeedCard>

            {/* Recent Posts */}
            <FeedCard title="Derniers posts" href="/admin/content">
              {stats?.content.recentPosts &&
              stats.content.recentPosts.length > 0 ? (
                <div className="space-y-1">
                  {stats.content.recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Avatar className="h-8 w-8 mt-0.5">
                        <AvatarImage src={post.user.image} />
                        <AvatarFallback className="text-xs bg-slate-100 text-slate-400">
                          {post.user.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          {post.user.name}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span>{post._count.likes} likes</span>
                          <span>{post._count.comments} commentaires</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={MessageSquareText}
                  message="Aucun post recent"
                  actionLabel="Voir le contenu"
                  actionHref="/admin/content"
                />
              )}
            </FeedCard>

            {/* Recent AI Actions */}
            <FeedCard title="Actions AI" href="/admin/audit">
              {stats?.audit.recentAI && stats.audit.recentAI.length > 0 ? (
                <div className="space-y-1.5">
                  {stats.audit.recentAI.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <Zap className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-slate-700 truncate">
                            {log.action
                              .replace("AI_", "")
                              .replace(/_/g, " ")}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {log.user.name || log.user.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Activity}
                  message="Aucune action AI recente"
                  actionLabel="Voir les logs"
                  actionHref="/admin/audit"
                />
              )}
            </FeedCard>
          </div>
        </section>
      </div>
    </div>
  )
}
