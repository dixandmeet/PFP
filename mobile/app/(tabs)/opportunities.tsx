import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native"
import { useState, useCallback } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import { Role } from "@pfp/shared-constants"
import type { Listing } from "@pfp/shared-types"

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <TouchableOpacity
      className="bg-stadium-900 border border-stadium-800 rounded-2xl mx-4 mb-3 p-4"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-white text-base font-semibold" numberOfLines={2}>
            {listing.title}
          </Text>
          {listing.club && (
            <Text className="text-stadium-400 text-sm mt-1">
              {listing.club.clubName}
            </Text>
          )}
        </View>
        <View className="bg-pitch-500/15 px-2.5 py-1 rounded-full">
          <Text className="text-pitch-400 text-xs font-medium">
            {listing.position}
          </Text>
        </View>
      </View>

      <Text className="text-stadium-400 text-sm mt-2 leading-5" numberOfLines={2}>
        {listing.description}
      </Text>

      <View className="flex-row items-center mt-3 gap-4">
        {listing.location && (
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#71717a" />
            <Text className="text-stadium-500 text-xs ml-1">{listing.location}</Text>
          </View>
        )}
        {listing.level && (
          <View className="flex-row items-center">
            <Ionicons name="trophy-outline" size={14} color="#71717a" />
            <Text className="text-stadium-500 text-xs ml-1">{listing.level}</Text>
          </View>
        )}
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#71717a" />
          <Text className="text-stadium-500 text-xs ml-1">
            {new Date(listing.createdAt).toLocaleDateString("fr-FR")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function OpportunitiesScreen() {
  const { user } = useAuthStore()
  const [refreshing, setRefreshing] = useState(false)
  const isPlayer = user?.role === Role.PLAYER

  const { data: listings, refetch, isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const result = await api.get<Listing[]>("/listings?status=PUBLISHED")
      return result.data || []
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  return (
    <SafeAreaView className="flex-1 bg-stadium-950">
      {/* Header */}
      <View className="px-6 py-4 border-b border-stadium-800">
        <Text className="text-white text-lg font-bold">
          {isPlayer ? "Annonces" : "Opportunités"}
        </Text>
        <Text className="text-stadium-400 text-sm mt-1">
          {isPlayer
            ? "Trouvez votre prochaine opportunité"
            : "Identifiez les meilleures opportunités pour vos joueurs"}
        </Text>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="briefcase-outline" size={48} color="#3f3f46" />
            <Text className="text-stadium-500 text-sm mt-4">
              {isLoading ? "Chargement..." : "Aucune annonce disponible"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
