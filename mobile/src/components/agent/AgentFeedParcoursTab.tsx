import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native"
import { useCallback, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { api } from "@/lib/api"

type MeResponse = {
  id: string
  agentProfile?: { id: string } | null
}

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

type PostsResponse = {
  posts: unknown[]
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

type ActionRow = {
  key: string
  icon: keyof typeof Ionicons.glyphMap
  label: string
  description: string
  cta: string
  href?: string
  done: boolean
  onPress?: () => void
}

function ActionRowCard({ row }: { row: ActionRow }) {
  const go = () => {
    if (row.onPress) {
      row.onPress()
      return
    }
    if (row.href) router.push(row.href as never)
  }

  return (
    <View className="flex-row items-center justify-between rounded-xl border border-stadium-800 bg-stadium-900 px-3 py-3 mb-2">
      <View className="flex-row items-center flex-1 min-w-0 mr-2">
        <View
          className={`h-9 w-9 items-center justify-center rounded-lg ${row.done ? "bg-amber-500/20" : "bg-stadium-800"}`}
        >
          <Ionicons name={row.icon} size={18} color={row.done ? "#fbbf24" : "#a1a1aa"} />
        </View>
        <View className="ml-3 flex-1 min-w-0">
          <Text className="text-sm font-semibold text-white" numberOfLines={1}>
            {row.label}
          </Text>
          <Text className="text-xs text-stadium-500 mt-0.5" numberOfLines={2}>
            {row.description}
          </Text>
        </View>
      </View>
      {row.done ? (
        <View className="rounded-full bg-amber-500/20 px-2 py-1">
          <Text className="text-[11px] font-semibold text-amber-400">Fait</Text>
        </View>
      ) : (
        <TouchableOpacity
          className="rounded-lg bg-amber-500 px-3 py-1.5"
          onPress={go}
          activeOpacity={0.8}
        >
          <Text className="text-xs font-semibold text-stadium-950">{row.cta}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export function AgentFeedParcoursTab({ onOpenFeedComposer }: { onOpenFeedComposer?: () => void }) {
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["agent-feed-parcours"],
    queryFn: async () => {
      const meRes = await api.get<MeResponse>("/users/me")
      if (!meRes.success || !meRes.data?.agentProfile?.id) {
        return null
      }
      const agentId = meRes.data.agentProfile.id
      const userId = meRes.data.id

      const [agentRes, postsRes] = await Promise.all([
        api.get<AgentDetailResponse>(`/agents/${agentId}`),
        api.get<PostsResponse>(`/posts?userId=${encodeURIComponent(userId)}&limit=50`),
      ])

      const agent = agentRes.success && agentRes.data ? agentRes.data : null
      const posts = postsRes.success && postsRes.data?.posts ? postsRes.data.posts : []
      return { agent, postsCount: posts.length }
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  if (isLoading && !data) {
    return (
      <View className="py-16 items-center justify-center">
        <ActivityIndicator color="#fbbf24" />
      </View>
    )
  }

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center px-6 py-16">
        <Text className="text-stadium-400 text-center text-sm">
          Impossible de charger le parcours agent. Vérifiez votre connexion.
        </Text>
      </View>
    )
  }

  const agent = data.agent ?? null
  const postsCount = data?.postsCount ?? 0
  const mandatesCount = agent?.activeMandatesCount ?? 0
  const submissionsCount = agent?.submissionsCount ?? 0
  const profileDone = isProfileComplete(agent)

  const rows: ActionRow[] = [
    {
      key: "profile",
      icon: "business",
      label: "Profil professionnel complet",
      description: "Agence, bio, licence, photo et spécialités",
      cta: "Compléter",
      href: "/(tabs)/agent/edit-profile",
      done: profileDone,
    },
    {
      key: "mandate",
      icon: "people",
      label: "Représenter un joueur",
      description: "Au moins un mandat actif avec un joueur",
      cta: "Mes joueurs",
      href: "/(tabs)/agent/players",
      done: mandatesCount >= 1,
    },
    {
      key: "opps",
      icon: "flag",
      label: "Cibler les annonces clubs",
      description: "Parcourez les besoins des clubs pour vos protégés",
      cta: "Voir",
      href: "/(tabs)/opportunities",
      done: false,
    },
    {
      key: "sub",
      icon: "send",
      label: "Soumettre un joueur à une offre",
      description: "Envoyez une candidature pour placer un joueur",
      cta: "Soumissions",
      href: "/(tabs)/agent/submissions",
      done: submissionsCount >= 1,
    },
    {
      key: "post",
      icon: "create-outline",
      label: "Publier un premier post",
      description: "Restez visible pour votre réseau",
      cta: "Publier",
      href: "/(tabs)/feed",
      done: postsCount > 0,
      onPress: onOpenFeedComposer,
    },
  ]

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fbbf24" />}
    >
      <View className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 mb-4">
        <Text className="text-base font-bold text-white">Étapes pour recruter et placer vos joueurs</Text>
        <Text className="text-sm text-stadium-400 mt-1">
          Suivez ces actions pour structurer votre activité sur la plateforme.
        </Text>
      </View>
      {rows.map((row) => (
        <ActionRowCard key={row.key} row={row} />
      ))}
    </ScrollView>
  )
}
