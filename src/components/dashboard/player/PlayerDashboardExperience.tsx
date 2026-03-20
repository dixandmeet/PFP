"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardFeed } from "@/components/dashboard/DashboardFeed"
import { SuggestionsColumn } from "@/components/dashboard/SuggestionsColumn"
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { ActionItem } from "./ActionItem"
import { DashboardSection } from "./DashboardSection"
import { MissionItem } from "./MissionItem"
import { OpportunityCard } from "./OpportunityCard"
import { ScoreCard } from "./ScoreCard"
import { StatCard } from "./StatCard"
import {
  Activity,
  BarChart3,
  Camera,
  Columns,
  CircleUserRound,
  Goal,
  Heart,
  MessageSquare,
  PlayCircle,
  Send,
  Target,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  Flag,
} from "lucide-react"

type MeResponse = {
  id: string
  playerProfile?: {
    firstName?: string | null
    lastName?: string | null
    displayName?: string | null
    dateOfBirth?: string | null
    nationality?: string | null
    height?: number | null
    weight?: number | null
    strongFoot?: string | null
    primaryPosition?: string | null
    bio?: string | null
    profilePicture?: string | null
  } | null
}

type SectionKey = "profil" | "stats" | "score" | "opportunites" | "videos" | "feed"

export function PlayerDashboardExperience() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [profileViews, setProfileViews] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [messagesCount, setMessagesCount] = useState(0)
  const [likesReceived, setLikesReceived] = useState(0)
  const [postsCount, setPostsCount] = useState(0)
  const [videosCount, setVideosCount] = useState(0)
  const [bestVideoScore, setBestVideoScore] = useState(0)
  const [gamificationXp, setGamificationXp] = useState(0)
  const [opportunityClubsCount, setOpportunityClubsCount] = useState(0)
  const [opportunityAgentsCount, setOpportunityAgentsCount] = useState(0)
  const [opportunityPlayersCount, setOpportunityPlayersCount] = useState(0)
  const [selectedSection, setSelectedSection] = useState<SectionKey>("feed")
  const [feedComposerSignal, setFeedComposerSignal] = useState(0)
  const [menuVisible, setMenuVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadDashboardData() {
      try {
        const meRes = await fetch("/api/users/me")
        if (!meRes.ok) return
        const meData: MeResponse = await meRes.json()
        if (cancelled) return
        setMe(meData)

        const userId = meData.id
        const [followStatsRes, profileViewsRes, messagesRes, postsRes, videosRes, statusRes, suggestionsRes] =
          await Promise.all([
            fetch(`/api/users/${userId}/follow`),
            fetch("/api/profile-views?limit=1"),
            fetch("/api/messages/conversations?limit=1"),
            fetch(`/api/posts?userId=${userId}&limit=50`),
            fetch("/api/player/gamification/videos"),
            fetch("/api/player/gamification/status"),
            fetch("/api/search/suggestions?type=all&limit=12"),
          ])

        if (!followStatsRes.ok || !profileViewsRes.ok || !messagesRes.ok || !postsRes.ok || !videosRes.ok || !statusRes.ok) {
          return
        }

        const followStats = await followStatsRes.json()
        const profileViewsData = await profileViewsRes.json()
        const messagesData = await messagesRes.json()
        const postsData = await postsRes.json()
        const videosData = await videosRes.json()
        const statusData = await statusRes.json()
        const suggestionsData = suggestionsRes.ok ? await suggestionsRes.json() : null

        if (cancelled) return

        setFollowersCount(followStats.followersCount ?? 0)
        setFollowingCount(followStats.followingCount ?? 0)
        setProfileViews(profileViewsData.total ?? 0)
        setMessagesCount(messagesData.total ?? 0)

        const ownPosts = Array.isArray(postsData.posts) ? postsData.posts : []
        setPostsCount(ownPosts.length)
        const likes = ownPosts.reduce(
          (sum: number, post: { _count?: { likes?: number } }) => sum + (post._count?.likes ?? 0),
          0
        )
        setLikesReceived(likes)

        const videos = Array.isArray(videosData.videos) ? videosData.videos : []
        setVideosCount(videos.length)
        const topScore = videos.reduce(
          (max: number, video: { totalScore?: number | null }) => Math.max(max, video.totalScore ?? 0),
          0
        )
        setBestVideoScore(topScore)

        setGamificationXp(statusData?.progression?.xp ?? 0)

        const clubsCount = Array.isArray(suggestionsData?.clubs) ? suggestionsData.clubs.length : 0
        const agentsCount = Array.isArray(suggestionsData?.agents) ? suggestionsData.agents.length : 0
        const playersCount = Array.isArray(suggestionsData?.players) ? suggestionsData.players.length : 0
        setOpportunityClubsCount(clubsCount)
        setOpportunityAgentsCount(agentsCount)
        setOpportunityPlayersCount(playersCount)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboardData()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      const isMobile = window.innerWidth < 1280

      if (!isMobile) {
        setMenuVisible(true)
        setLastScrollY(y)
        return
      }

      if (y < 24) {
        setMenuVisible(true)
      } else if (y > lastScrollY) {
        setMenuVisible(false)
      } else {
        setMenuVisible(true)
      }
      setLastScrollY(y)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [lastScrollY])

  useEffect(() => {
    const section = searchParams.get("section")
    if (!section) return

    if (
      section === "feed" ||
      section === "profil" ||
      section === "stats" ||
      section === "score" ||
      section === "opportunites" ||
      section === "videos"
    ) {
      setSelectedSection(section)
    }
  }, [searchParams])

  useEffect(() => {
    const compose = searchParams.get("compose")
    if (compose === "1") {
      setSelectedSection("feed")
      setFeedComposerSignal((v) => v + 1)
    }
  }, [searchParams])

  const completion = useMemo(() => {
    const profile = me?.playerProfile
    if (!profile) return 0
    const checks = [
      !!profile.profilePicture,
      !!profile.firstName && !!profile.lastName,
      !!profile.primaryPosition,
      !!profile.height && !!profile.weight && !!profile.strongFoot,
      !!profile.bio,
      !!profile.nationality,
      !!profile.dateOfBirth,
      postsCount > 0,
      followingCount >= 5,
      videosCount > 0,
    ]
    const done = checks.filter(Boolean).length
    return Math.round((done / checks.length) * 100)
  }, [me, postsCount, followingCount, videosCount])

  const scoreBreakdown = useMemo(() => {
    const profile = Math.min(25, Math.round((completion / 100) * 25))
    const activity = Math.min(25, Math.round(Math.min(1, (postsCount + videosCount * 2) / 12) * 25))
    const engagement = Math.min(
      25,
      Math.round(Math.min(1, (likesReceived + profileViews + messagesCount) / 150) * 25)
    )
    const network = Math.min(25, Math.round(Math.min(1, (followersCount + followingCount) / 120) * 25))
    return { profile, activity, engagement, network }
  }, [completion, postsCount, videosCount, likesReceived, profileViews, messagesCount, followersCount, followingCount])

  const playerScore = scoreBreakdown.profile + scoreBreakdown.activity + scoreBreakdown.engagement + scoreBreakdown.network

  const missions = [
    { icon: Send, label: "Publier 1 contenu", points: 5, completed: postsCount > 0 },
    { icon: Camera, label: "Ajouter 1 video", points: 10, completed: videosCount > 0 },
    { icon: UserPlus, label: "Suivre 3 clubs", points: 3, completed: followingCount >= 3 },
  ]

  const actions = [
    {
      icon: Camera,
      label: "Ajouter une video",
      description: "Montrez vos meilleurs highlights aux recruteurs",
      ctaLabel: "Ajouter",
      href: "/player/profile/edit?focus=video",
      done: videosCount > 0,
    },
    {
      icon: CircleUserRound,
      label: "Completer les infos personnelles",
      description: "Des informations d'identite et de contact sont manquantes",
      ctaLabel: "Completer",
      href: "/player/profile/edit",
      done: !!me?.playerProfile?.firstName && !!me?.playerProfile?.lastName && !!me?.playerProfile?.dateOfBirth,
    },
    {
      icon: Goal,
      label: "Ajouter votre poste",
      description: "Le poste principal et secondaire augmentent le matching",
      ctaLabel: "Ajouter",
      href: "/player/profile/edit?focus=position",
      done: !!me?.playerProfile?.primaryPosition,
    },
    {
      icon: BarChart3,
      label: "Ajouter les donnees physiques",
      description: "Taille, poids, pied fort",
      ctaLabel: "Ajouter",
      href: "/player/profile/edit?focus=stats",
      done: !!me?.playerProfile?.height && !!me?.playerProfile?.weight && !!me?.playerProfile?.strongFoot,
    },
    {
      icon: Send,
      label: "Publier un premier post",
      description: "Restez actif pour augmenter votre visibilite",
      ctaLabel: "Publier",
      href: "/player/dashboard?section=feed",
      done: postsCount > 0,
    },
    {
      icon: UserPlus,
      label: "Suivre au moins 5 clubs",
      description: "Developpez votre reseau pour recevoir des opportunites pertinentes",
      ctaLabel: "Suivre",
      href: "/search?tab=clubs",
      done: followingCount >= 5,
    },
  ]

  const kpis = [
    { icon: TrendingUp, label: "Vues du profil", value: String(profileViews), trend: profileViews > 0 ? "+100%" : "0%" },
    { icon: Users, label: "Abonnes", value: String(followersCount), trend: followersCount > 0 ? "+100%" : "0%" },
    { icon: UserPlus, label: "Abonnements", value: String(followingCount), trend: followingCount > 0 ? "+100%" : "0%" },
    { icon: PlayCircle, label: "Videos publiees", value: String(videosCount), trend: videosCount > 0 ? "+100%" : "0%" },
    { icon: Heart, label: "Likes recus", value: String(likesReceived), trend: likesReceived > 0 ? "+100%" : "0%" },
    { icon: MessageSquare, label: "Messages recus", value: String(messagesCount), trend: messagesCount > 0 ? "+100%" : "0%" },
  ]

  const opportunities = [
    {
      icon: Trophy,
      title: "Clubs qui recherchent votre poste",
      description: `${opportunityClubsCount} clubs suggeres selon votre profil.`,
      ctaLabel: "Voir",
      href: "/player/opportunities",
    },
    {
      icon: Activity,
      title: "Scouts actifs dans votre region",
      description: `${profileViews} consultations de profil peuvent indiquer un interet scout.`,
      ctaLabel: "Voir",
      href: "/search?tab=agents",
    },
    {
      icon: Users,
      title: "Agents suggeres",
      description: `${opportunityAgentsCount} agents pertinents detectes.`,
      ctaLabel: "Voir",
      href: "/player/agents",
    },
    {
      icon: Columns,
      title: "Joueurs similaires",
      description: `${opportunityPlayersCount} profils similaires trouves.`,
      ctaLabel: "Voir",
      href: "/search?tab=players",
    },
  ]

  const completedMissions = missions.filter((mission) => mission.completed).length
  const sectionMenu = [
    { key: "feed", label: "Feed" },
    { key: "profil", label: "Profil" },
    { key: "stats", label: "Stats" },
    { key: "score", label: "Score" },
    { key: "opportunites", label: "Opportunites" },
    { key: "videos", label: "Videos" },
  ] as const
  const pendingProfileActions = actions.filter((action) => !action.done).length
  const sectionIndicators: Partial<Record<SectionKey, number>> = {
    profil: pendingProfileActions,
    videos: videosCount === 0 ? 1 : 0,
    feed: postsCount === 0 ? 1 : 0,
    opportunites: followingCount < 5 ? 1 : 0,
  }
  const priorityOrder: SectionKey[] = ["profil", "videos", "feed", "opportunites", "stats", "score"]
  const prioritySection =
    priorityOrder.find((key) => (sectionIndicators[key] ?? 0) > 0) ?? null
  const nextProfileAction = actions.find((action) => !action.done) ?? null

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
        <DashboardTopBar title="Dashboard Joueur" ctaLabel="Completer le profil" ctaHref="/player/profile/edit" />

        <div
          className={`sticky z-20 mt-4 overflow-x-auto rounded-2xl border border-stadium-200 bg-white/95 p-2.5 shadow-sm backdrop-blur transition-transform duration-300 xl:top-4 ${
            menuVisible ? "translate-y-0" : "-translate-y-[140%]"
          }`}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stadium-500">
              Navigation sections
            </p>
            {pendingProfileActions > 0 && (
              <p className="text-[11px] font-medium text-pitch-700">
                {pendingProfileActions} action{pendingProfileActions > 1 ? "s" : ""} a completer
              </p>
            )}
          </div>
          <div className="flex min-w-max items-center gap-2">
            {sectionMenu.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedSection(item.key)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedSection === item.key
                    ? "border-pitch-300 bg-gradient-to-r from-pitch-100 to-pitch-50 text-pitch-800 shadow-sm"
                    : "border-stadium-200 bg-stadium-50 text-stadium-700 hover:border-pitch-300 hover:bg-pitch-50 hover:text-pitch-700"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {item.label}
                  {(sectionIndicators[item.key] ?? 0) > 0 && (
                    <span className="relative inline-flex items-center">
                      <span
                        className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                          selectedSection === item.key
                            ? "bg-pitch-700 text-white"
                            : "bg-pitch-200 text-pitch-800"
                        }`}
                        title="Action recommandee dans cette section"
                      >
                        {sectionIndicators[item.key]}
                      </span>
                      {prioritySection === item.key && selectedSection !== item.key && (
                        <span className="absolute -right-1 -top-1 inline-flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pitch-500/70" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-white bg-pitch-500" />
                        </span>
                      )}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">

          <main className="space-y-6 xl:col-span-9">
            <section className="rounded-2xl border border-pitch-200 bg-gradient-to-r from-pitch-50 via-white to-pitch-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-pitch-100 p-2 text-pitch-700">
                  <Flag className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stadium-900">
                    {loading ? "Chargement de votre espace..." : "Objectif du jour: passer au niveau superieur"}
                  </p>
                  <p className="mt-1 text-xs text-stadium-600">
                    Concentrez-vous sur une section a la fois pour avancer plus vite.
                  </p>
                </div>
              </div>
            </section>

            {selectedSection === "profil" && <DashboardSection
              id="section-profil"
              title="🚀 Ameliore ton profil"
              subtitle="Completer ton profil augmente la visibilite et les opportunites."
              className="border-pitch-200 bg-gradient-to-b from-pitch-50 to-white"
            >
              {nextProfileAction && (
                <div className="mb-4 rounded-xl border border-pitch-200 bg-pitch-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-pitch-700">
                    Prochaine action recommandee
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-stadium-900">{nextProfileAction.label}</p>
                    <Link
                      href={nextProfileAction.href}
                      className="shrink-0 rounded-lg bg-pitch-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pitch-700"
                    >
                      {nextProfileAction.ctaLabel}
                    </Link>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-stadium-600">Progression</span>
                  <span className="font-semibold text-stadium-900">{completion}% complete</span>
                </div>
                <Progress value={completion} className="h-2.5 bg-stadium-100 [&>div]:bg-pitch-600" />
              </div>
              {completion < 100 && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Plus votre profil est complet, plus vous remontez dans les resultats des recruteurs.
                </p>
              )}
              <div className="mt-4 space-y-2">
                {actions.map((action) => (
                  <ActionItem key={action.label} {...action} />
                ))}
              </div>
            </DashboardSection>}

            {selectedSection === "stats" && <DashboardSection
              id="section-stats"
              title="Statistiques joueur"
              subtitle="Mesurez votre traction sur la plateforme."
              className="p-5"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {kpis.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>
            </DashboardSection>}

            {selectedSection === "score" && <div id="section-score" className="scroll-mt-24">
              <ScoreCard
                score={playerScore}
                breakdown={scoreBreakdown}
              />
            </div>}

            {selectedSection === "opportunites" && <DashboardSection
              id="section-opportunites"
              title="Opportunites pour toi"
              subtitle="Suggestions personnalisees selon ton profil."
            >
              {followingCount < 5 && (
                <div className="mb-4 rounded-xl border border-pitch-200 bg-pitch-50 p-3">
                  <p className="text-sm text-stadium-800">
                    Suivez encore <span className="font-semibold">{5 - followingCount}</span> club(s) pour debloquer plus d&apos;opportunites.
                  </p>
                  <Link
                    href="/search?tab=clubs"
                    className="mt-2 inline-flex rounded-lg bg-pitch-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pitch-700"
                  >
                    Trouver des clubs
                  </Link>
                </div>
              )}
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {opportunities.map((opportunity) => (
                  <OpportunityCard key={opportunity.title} {...opportunity} />
                ))}
              </div>
            </DashboardSection>}

            {selectedSection === "videos" && <DashboardSection
              id="section-videos"
              title="🎬 Tes videos"
              subtitle="Les profils avec videos sont 3x plus consultes par les recruteurs."
            >
              {videosCount === 0 && (
                <div className="mb-4 rounded-xl border border-pitch-200 bg-pitch-50 p-3">
                  <p className="text-sm text-stadium-800">
                    Ajoutez une premiere video pour augmenter votre visibilite aupres des recruteurs.
                  </p>
                  <Link
                    href="/player/profile/edit?focus=video"
                    className="mt-2 inline-flex rounded-lg bg-pitch-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pitch-700"
                  >
                    Ajouter une video
                  </Link>
                </div>
              )}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-stadium-200 bg-stadium-50 p-3">
                  <p className="text-xs text-stadium-500">Vues videos totales</p>
                  <p className="mt-1 text-xl font-bold text-stadium-900">{videosCount}</p>
                </div>
                <div className="rounded-xl border border-stadium-200 bg-stadium-50 p-3 sm:col-span-2">
                  <p className="text-xs text-stadium-500">Meilleure video (score qualite)</p>
                  <p className="mt-1 text-sm font-semibold text-stadium-900">
                    {bestVideoScore > 0 ? `Score ${bestVideoScore}/100` : "Aucune video evaluee"}
                  </p>
                  <p className="text-xs text-pitch-700">{gamificationXp} XP cumules</p>
                </div>
              </div>
              <a
                href="/player/profile/edit?focus=video"
                className="mt-4 inline-flex rounded-lg bg-pitch-600 px-3 py-2 text-sm font-semibold text-white hover:bg-pitch-700"
              >
                Ajouter une video
              </a>
            </DashboardSection>}

            {selectedSection === "feed" && (
              <div id="section-feed-social" className="scroll-mt-24">
                {postsCount === 0 && (
                  <div className="mb-3 rounded-xl border border-pitch-200 bg-pitch-50 p-3">
                    <p className="text-sm text-stadium-800">
                      Publiez votre premier contenu pour lancer votre dynamique de visibilite.
                    </p>
                    <Link
                      href="/player/dashboard?section=feed&compose=1"
                      className="mt-2 inline-flex rounded-lg bg-pitch-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pitch-700"
                    >
                      Creer un post
                    </Link>
                  </div>
                )}
                <DashboardFeed role="PLAYER" openComposerSignal={feedComposerSignal} />
              </div>
            )}
          </main>

          <aside className="hidden xl:col-span-3 xl:block">
            <SuggestionsColumn role="PLAYER" />
          </aside>
        </div>
      </div>
    </div>
  )
}
