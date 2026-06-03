"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { KPIStatCard } from "@/components/club/teams/KPIStatCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  STATUS_CONFIG,
  SOURCE_LABELS,
  formatPosition,
  type ClubRecruitmentItem,
} from "@/lib/club/recruitment"
import type { ClubDashboardData } from "@/lib/services/club-dashboard"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Target,
  ClipboardList,
  Users,
  FileText,
  Rss,
  MessageCircle,
  Building2,
  Inbox,
  Eye,
  ArrowRight,
  Clock,
  FileSignature,
} from "lucide-react"

interface ClubDashboardExperienceProps {
  data: ClubDashboardData
  clubStatus: string | null
  showOnboardingCard: boolean
  clubActive: boolean
}

function KpiLink({
  href,
  disabled,
  children,
}: {
  href: string
  disabled?: boolean
  children: React.ReactNode
}) {
  if (disabled) {
    return (
      <div className="opacity-50 pointer-events-none" aria-disabled>
        {children}
      </div>
    )
  }
  return (
    <Link href={href} className="block transition-transform hover:scale-[1.02]">
      {children}
    </Link>
  )
}

function OnboardingBanners({
  showOnboardingCard,
  clubStatus,
}: {
  showOnboardingCard: boolean
  clubStatus: string | null
}) {
  return (
    <>
      {showOnboardingCard && (
        <Link
          href="/club/onboarding"
          className="block p-5 rounded-xl border-2 border-pitch-200 bg-pitch-50/80 hover:bg-pitch-100/80 hover:border-pitch-300 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-pitch-500 flex items-center justify-center shrink-0">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stadium-900">
                Finaliser votre onboarding
              </h3>
              <p className="text-sm text-stadium-600 mt-1">
                Complétez l&apos;enregistrement de votre club pour débloquer la
                gestion du profil, des équipes et des annonces.
              </p>
              <span className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-pitch-600">
                Continuer
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {clubStatus === "PENDING_REVIEW" && (
        <div className="p-5 rounded-xl border-2 border-amber-200 bg-amber-50/80">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stadium-900">
                Club en cours de vérification
              </h3>
              <p className="text-sm text-stadium-600 mt-1">
                Votre demande d&apos;enregistrement est en cours de vérification
                par notre équipe. Vous serez notifié une fois la validation
                terminée.
              </p>
            </div>
          </div>
        </div>
      )}

      {clubStatus === "REJECTED" && (
        <Link
          href="/club/onboarding"
          className="block p-5 rounded-xl border-2 border-red-200 bg-red-50/80 hover:bg-red-100/80 hover:border-red-300 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center shrink-0">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stadium-900">Demande refusée</h3>
              <p className="text-sm text-stadium-600 mt-1">
                Votre demande d&apos;enregistrement a été refusée. Veuillez
                corriger les informations et resoumettre.
              </p>
              <span className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-red-600">
                Corriger et resoumettre
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      )}
    </>
  )
}

function RecentItemRow({ item }: { item: ClubRecruitmentItem }) {
  const statusInfo = STATUS_CONFIG[item.status] ?? {
    label: item.status,
    color: "bg-stadium-100 text-stadium-700 border-stadium-200",
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-stadium-200 bg-white px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-stadium-900">
          {item.player.firstName} {item.player.lastName}
        </p>
        <p className="truncate text-xs text-stadium-500">
          {formatPosition(item.player.primaryPosition)} ·{" "}
          {SOURCE_LABELS[item.source]} ·{" "}
          {formatDistanceToNow(new Date(item.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </div>
      <Badge variant="outline" className={cn("shrink-0 text-xs", statusInfo.color)}>
        {statusInfo.label}
      </Badge>
    </div>
  )
}

const quickActions = [
  {
    title: "Recrutement",
    description: "Candidatures et propositions",
    href: "/club/recruitment",
    icon: ClipboardList,
    color: "bg-blue-50 text-blue-600",
    requiresActive: true,
  },
  {
    title: "Annonces",
    description: "Offres publiées",
    href: "/club/listings",
    icon: Target,
    color: "bg-pitch-50 text-pitch-600",
    requiresActive: true,
  },
  {
    title: "Rapports",
    description: "Rapports joueurs et matchs",
    href: "/club/reports",
    icon: FileText,
    color: "bg-violet-50 text-violet-600",
    requiresActive: true,
  },
  {
    title: "Fil d'actualité",
    description: "Posts et communauté",
    href: "/club/feed",
    icon: Rss,
    color: "bg-amber-50 text-amber-600",
    requiresActive: false,
  },
  {
    title: "Messages",
    description: "Conversations",
    href: "/club/messages",
    icon: MessageCircle,
    color: "bg-sky-50 text-sky-600",
    requiresActive: false,
  },
  {
    title: "Équipes",
    description: "Effectifs et staff",
    href: "/club/teams",
    icon: Users,
    color: "bg-emerald-50 text-emerald-600",
    requiresActive: true,
  },
] as const

export function ClubDashboardExperience({
  data,
  clubStatus,
  showOnboardingCard,
  clubActive,
}: ClubDashboardExperienceProps) {
  const { kpis, recentItems, clubName } = data
  const gestionDisabled = !clubActive

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-victory-500 to-victory-600 text-white shadow-sm">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stadium-900 sm:text-3xl">
            Bonjour, {clubName}
          </h1>
          <p className="mt-1 text-sm text-stadium-500">
            Vue d&apos;ensemble de votre activité recrutement et club
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <OnboardingBanners
          showOnboardingCard={showOnboardingCard}
          clubStatus={clubStatus}
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiLink href="/club/listings" disabled={gestionDisabled}>
            <KPIStatCard
              label="Annonces actives"
              value={kpis.activeListings}
              icon={Target}
              iconClassName="bg-pitch-50 text-pitch-600"
            />
          </KpiLink>
          <KpiLink href="/club/recruitment" disabled={gestionDisabled}>
            <KPIStatCard
              label="Nouvelles candidatures"
              value={kpis.newRecruitment}
              icon={Inbox}
              iconClassName="bg-blue-50 text-blue-600"
            />
          </KpiLink>
          <KpiLink href="/club/recruitment" disabled={gestionDisabled}>
            <KPIStatCard
              label="Pipeline actif"
              value={kpis.activePipeline}
              icon={Eye}
              iconClassName="bg-sky-50 text-sky-600"
            />
          </KpiLink>
          <KpiLink href="/club/teams" disabled={gestionDisabled}>
            <KPIStatCard
              label="Équipes"
              value={kpis.teamsCount}
              icon={Building2}
              iconClassName="bg-emerald-50 text-emerald-600"
            />
          </KpiLink>
        </div>

        {clubActive && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiLink href="/club/reports">
              <KPIStatCard
                label="Rapports"
                value={kpis.reportsCount}
                icon={FileText}
                iconClassName="bg-violet-50 text-violet-600"
              />
            </KpiLink>
            <KpiLink href="/club/teams">
              <KPIStatCard
                label="Membres staff"
                value={kpis.activeMembersCount}
                icon={Users}
                iconClassName="bg-stadium-100 text-stadium-600"
              />
            </KpiLink>
          </div>
        )}

        {clubActive && recentItems.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-stadium-900">
                Dossiers récents
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/club/recruitment">
                  Voir tout
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              {recentItems.map((item) => (
                <RecentItemRow key={`${item.source}-${item.id}`} item={item} />
              ))}
            </div>
          </section>
        )}

        {clubActive && recentItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-stadium-200 bg-white px-6 py-8 text-center">
            <FileSignature className="mx-auto h-8 w-8 text-stadium-300" />
            <p className="mt-2 text-sm font-medium text-stadium-700">
              Aucun dossier de recrutement pour le moment
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/club/listings">Publier une annonce</Link>
            </Button>
          </div>
        )}

        <section>
          <h2 className="mb-3 text-lg font-bold text-stadium-900">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              const disabled = action.requiresActive && gestionDisabled
              const content = (
                <div
                  className={cn(
                    "group flex items-start gap-4 rounded-xl border border-stadium-200 bg-white p-4 transition-all",
                    !disabled &&
                      "hover:border-pitch-300 hover:shadow-md cursor-pointer",
                    disabled && "opacity-50 pointer-events-none"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      action.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-stadium-900 group-hover:text-pitch-700">
                      {action.title}
                    </h3>
                    <p className="text-sm text-stadium-500">{action.description}</p>
                  </div>
                </div>
              )

              if (disabled) {
                return <div key={action.href}>{content}</div>
              }

              return (
                <Link key={action.href} href={action.href}>
                  {content}
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
