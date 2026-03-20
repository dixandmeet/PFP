import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native"
import { useCallback, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { api } from "@/lib/api"

interface Mandate {
  id: string
  status: string
  playerProfile?: {
    id: string
    firstName?: string
    lastName?: string
    primaryPosition?: string
    profilePicture?: string | null
  }
}

export function AgentFeedJoueursTab() {
  const [refreshing, setRefreshing] = useState(false)

  const { data: mandates, isLoading, refetch } = useQuery({
    queryKey: ["agent-feed-mandates"],
    queryFn: async () => {
      const result = await api.get<{ mandates?: Mandate[] } | Mandate[]>("/mandates")
      if (!result.success || !result.data) return []
      const raw = result.data
      if (Array.isArray(raw)) return raw
      return raw.mandates ?? []
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const active = (mandates ?? []).filter((m) => m.status === "ACTIVE" && m.playerProfile)

  if (isLoading && !mandates) {
    return (
      <View className="py-16 items-center justify-center">
        <ActivityIndicator color="#fbbf24" />
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fbbf24" />}
    >
      <TouchableOpacity
        className="flex-row items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 mb-4"
        onPress={() => router.push("/(tabs)/agent/players")}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center flex-1">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
            <Ionicons name="people" size={22} color="#fbbf24" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-white font-semibold">Gérer mes joueurs</Text>
            <Text className="text-stadium-400 text-xs mt-0.5">
              Mandats, recherche et candidatures
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#71717a" />
      </TouchableOpacity>

      <Text className="text-stadium-400 text-xs font-semibold uppercase tracking-wide mb-2">
        Mandats actifs ({active.length})
      </Text>

      {active.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-stadium-700 bg-stadium-900/50 p-8 items-center">
          <Ionicons name="person-add-outline" size={40} color="#52525b" />
          <Text className="text-stadium-400 text-sm text-center mt-3">
            Aucun joueur sous mandat pour le moment. Ajoutez un mandat depuis l&apos;écran dédié.
          </Text>
          <TouchableOpacity
            className="mt-4 rounded-xl bg-amber-500 px-5 py-2.5"
            onPress={() => router.push("/(tabs)/agent/players")}
          >
            <Text className="text-stadium-950 text-sm font-semibold">Voir mes joueurs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        active.map((m) => {
          const p = m.playerProfile!
          const name =
            [p.firstName, p.lastName].filter(Boolean).join(" ").trim() || "Joueur"
          return (
            <TouchableOpacity
              key={m.id}
              className="flex-row items-center rounded-xl border border-stadium-800 bg-stadium-900 px-4 py-3 mb-2"
              onPress={() => router.push("/(tabs)/agent/players")}
              activeOpacity={0.7}
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-stadium-800">
                <Text className="text-white font-bold text-base">{name.charAt(0).toUpperCase()}</Text>
              </View>
              <View className="ml-3 flex-1 min-w-0">
                <Text className="text-white font-semibold" numberOfLines={1}>
                  {name}
                </Text>
                {p.primaryPosition ? (
                  <Text className="text-stadium-500 text-xs mt-0.5">{p.primaryPosition}</Text>
                ) : null}
              </View>
              <View className="rounded-full bg-pitch-500/20 px-2 py-1">
                <Text className="text-pitch-400 text-[10px] font-semibold">Actif</Text>
              </View>
            </TouchableOpacity>
          )
        })
      )}
    </ScrollView>
  )
}
