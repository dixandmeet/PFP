import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native"
import { useState, useCallback } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Application } from "@pfp/shared-types"

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-stadium-600/20", text: "text-stadium-400", label: "Brouillon" },
  SUBMITTED: { bg: "bg-blue-500/15", text: "text-blue-400", label: "Envoyée" },
  UNDER_REVIEW: { bg: "bg-gold-500/15", text: "text-gold-400", label: "En examen" },
  SHORTLISTED: { bg: "bg-pitch-500/15", text: "text-pitch-400", label: "Présélectionné" },
  TRIAL: { bg: "bg-victory-500/15", text: "text-victory-400", label: "Essai" },
  REJECTED: { bg: "bg-red-500/15", text: "text-red-400", label: "Refusée" },
  ACCEPTED: { bg: "bg-pitch-500/15", text: "text-pitch-400", label: "Acceptée" },
  SIGNED: { bg: "bg-gold-500/15", text: "text-gold-400", label: "Signée" },
}

export default function PlayerApplicationsScreen() {
  const [refreshing, setRefreshing] = useState(false)

  const { data: applications, refetch, isLoading } = useQuery({
    queryKey: ["player-applications"],
    queryFn: async () => {
      const result = await api.get<Application[]>("/applications")
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
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const status = STATUS_COLORS[item.status] || STATUS_COLORS.DRAFT
          return (
            <TouchableOpacity
              className="bg-stadium-900 border border-stadium-800 rounded-2xl mx-4 mb-3 p-4"
              activeOpacity={0.7}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-white text-base font-semibold" numberOfLines={2}>
                    {item.listing?.title || "Annonce"}
                  </Text>
                  {item.listing?.club && (
                    <Text className="text-stadium-400 text-sm mt-1">
                      {item.listing.club.clubName}
                    </Text>
                  )}
                </View>
                <View className={`${status.bg} px-2.5 py-1 rounded-full`}>
                  <Text className={`${status.text} text-xs font-medium`}>
                    {status.label}
                  </Text>
                </View>
              </View>
              <Text className="text-stadium-500 text-xs mt-2">
                {new Date(item.createdAt).toLocaleDateString("fr-FR")}
              </Text>
            </TouchableOpacity>
          )
        }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="document-text-outline" size={48} color="#3f3f46" />
            <Text className="text-stadium-500 text-sm mt-4">
              {isLoading ? "Chargement..." : "Aucune candidature"}
            </Text>
          </View>
        }
      />
    </View>
  )
}
