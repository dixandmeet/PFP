import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native"
import { useState, useCallback } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface Mandate {
  id: string
  status: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  player?: {
    firstName: string | null
    lastName: string | null
  }
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "En attente", color: "text-gold-400", bg: "bg-gold-500/15" },
  ACTIVE: { label: "Actif", color: "text-pitch-400", bg: "bg-pitch-500/15" },
  EXPIRED: { label: "Expiré", color: "text-stadium-400", bg: "bg-stadium-600/20" },
  TERMINATED: { label: "Résilié", color: "text-red-400", bg: "bg-red-500/15" },
  REJECTED: { label: "Refusé", color: "text-red-400", bg: "bg-red-500/15" },
}

export default function AgentMandatesScreen() {
  const [refreshing, setRefreshing] = useState(false)

  const { data: mandates, refetch, isLoading } = useQuery({
    queryKey: ["agent-mandates"],
    queryFn: async () => {
      const result = await api.get<Mandate[]>("/mandates")
      return result.data || []
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  return (
    <View className="flex-1 bg-stadium-950">
      <FlatList
        data={mandates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const status = STATUS_LABELS[item.status] || STATUS_LABELS.PENDING
          const playerName = [item.player?.firstName, item.player?.lastName]
            .filter(Boolean)
            .join(" ") || "Joueur"

          return (
            <TouchableOpacity
              className="bg-stadium-900 border border-stadium-800 rounded-2xl mx-4 mb-3 p-4"
              activeOpacity={0.7}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-white text-base font-semibold">
                    {playerName}
                  </Text>
                  {item.endDate && (
                    <Text className="text-stadium-400 text-sm mt-1">
                      Expire le {new Date(item.endDate).toLocaleDateString("fr-FR")}
                    </Text>
                  )}
                </View>
                <View className={`${status.bg} px-2.5 py-1 rounded-full`}>
                  <Text className={`${status.color} text-xs font-medium`}>
                    {status.label}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="document-outline" size={48} color="#3f3f46" />
            <Text className="text-stadium-500 text-sm mt-4">
              {isLoading ? "Chargement..." : "Aucun mandat"}
            </Text>
          </View>
        }
      />
    </View>
  )
}
