"use client"

import { useEffect, useState } from "react"
import { Building2, Loader2, PenSquare, Send, Target, Users } from "lucide-react"
import { DashboardSection } from "@/components/dashboard/player/DashboardSection"
import { ActionItem } from "@/components/dashboard/player/ActionItem"

type AgentDetailResponse = {
  agencyName?: string | null
  bio?: string | null
  licenseNumber?: string | null
  licenseCountry?: string | null
  profilePicture?: string | null
  specialties?: string[] | null
  activeMandatesCount?: number
  submissionsCount?: number
}

function isProfileComplete(a: AgentDetailResponse | null): boolean {
  if (!a) return false
  const specs = a.specialties?.length ?? 0
  return (
    !!a.agencyName?.trim() &&
    !!a.bio?.trim() &&
    !!a.licenseNumber?.trim() &&
    !!a.licenseCountry?.trim() &&
    !!a.profilePicture &&
    specs > 0
  )
}

export function AgentProfileJourneyTab({
  userId,
  agentProfileId,
}: {
  userId: string
  agentProfileId: string
}) {
  const [loading, setLoading] = useState(true)
  const [agent, setAgent] = useState<AgentDetailResponse | null>(null)
  const [postsCount, setPostsCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [agentRes, postsRes] = await Promise.all([
          fetch(`/api/agents/${agentProfileId}`),
          fetch(`/api/posts?userId=${encodeURIComponent(userId)}&limit=50`),
        ])

        if (agentRes.ok) {
          const agentData: AgentDetailResponse = await agentRes.json()
          if (!cancelled) setAgent(agentData)
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json()
          const posts = Array.isArray(postsData.posts) ? postsData.posts : []
          if (!cancelled) setPostsCount(posts.length)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId, agentProfileId])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    )
  }

  const mandatesCount = agent?.activeMandatesCount ?? 0
  const submissionsCount = agent?.submissionsCount ?? 0
  const profileDone = isProfileComplete(agent)

  return (
    <DashboardSection
      title="Étapes pour recruter et placer vos joueurs"
      subtitle="Suivez ces actions pour structurer votre activité sur la plateforme."
      className="border-gold-200 bg-gradient-to-b from-gold-50/80 to-white"
    >
      <div className="space-y-3">
        <ActionItem
          icon={Building2}
          label="Profil professionnel complet"
          description="Agence, bio, licence, photo et spécialités"
          ctaLabel="Compléter"
          href="/agent/profile/edit"
          done={profileDone}
        />
        <ActionItem
          icon={Users}
          label="Représenter un joueur"
          description="Signez au moins un mandat actif avec un joueur"
          ctaLabel="Mes joueurs"
          href="/agent/players"
          done={mandatesCount >= 1}
        />
        <ActionItem
          icon={Target}
          label="Cibler les annonces clubs"
          description="Parcourez les besoins des clubs pour vos protégés"
          ctaLabel="Voir les annonces"
          href="/agent/opportunities"
          done={false}
        />
        <ActionItem
          icon={Send}
          label="Soumettre un joueur à une offre"
          description="Envoyez une candidature pour placer un joueur"
          ctaLabel="Soumissions"
          href="/agent/submissions"
          done={submissionsCount >= 1}
        />
        <ActionItem
          icon={PenSquare}
          label="Publier un premier post"
          description="Restez visible pour votre réseau"
          ctaLabel="Publier"
          href="/agent/dashboard"
          done={postsCount > 0}
        />
      </div>
    </DashboardSection>
  )
}
