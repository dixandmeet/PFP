import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native"
import { useState, useCallback } from "react"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

type ListingRow = {
  id: string
  title?: string | null
  description?: string | null
  position?: string
  level?: string | null
  location?: string | null
  createdAt?: string
  club?: { clubName: string; logoUrl?: string | null }
  clubProfile?: { clubName?: string | null }
  consulted?: boolean
  consultationCost?: number
}

function ListingCard({ listing }: { listing: ListingRow }) {
  const clubLabel = listing.club?.clubName ?? listing.clubProfile?.clubName ?? null
  const title = listing.title?.trim() || "Annonce"
  const desc = listing.description?.trim() || (listing.consulted === false ? "Détail disponible après consultation." : "")

  return (
    <TouchableOpacity
      className="bg-stadium-900 border border-stadium-800 rounded-2xl mx-4 mb-3 p-4"
      activeOpacity={0.7}
      onPress={() => router.push(`/listing/${listing.id}`)}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-white text-base font-semibold" numberOfLines={2}>
            {title}
          </Text>
          {clubLabel ? (
            <Text className="text-stadium-400 text-sm mt-1">
              {clubLabel}
            </Text>
          ) : null}
        </View>
        {listing.position ? (
          <View className="bg-pitch-500/15 px-2.5 py-1 rounded-full">
            <Text className="text-pitch-400 text-xs font-medium">
              {listing.position}
            </Text>
          </View>
        ) : null}
      </View>

      {desc ? (
        <Text className="text-stadium-400 text-sm mt-2 leading-5" numberOfLines={2}>
          {desc}
        </Text>
      ) : null}

      <View className="flex-row items-center mt-3 gap-4 flex-wrap">
        {listing.location ? (
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#71717a" />
            <Text className="text-stadium-500 text-xs ml-1">{listing.location}</Text>
          </View>
        ) : null}
        {listing.level ? (
          <View className="flex-row items-center">
            <Ionicons name="trophy-outline" size={14} color="#71717a" />
            <Text className="text-stadium-500 text-xs ml-1">{listing.level}</Text>
          </View>
        ) : null}
        {listing.createdAt ? (
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#71717a" />
            <Text className="text-stadium-500 text-xs ml-1">
              {new Date(listing.createdAt).toLocaleDateString("fr-FR")}
            </Text>
          </View>
        ) : null}
        {listing.consulted === false && listing.consultationCost != null ? (
          <View className="flex-row items-center">
            <Ionicons name="lock-closed-outline" size={14} color="#a3e635" />
            <Text className="text-pitch-400 text-xs ml-1">{listing.consultationCost} cr.</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  )
}

export default function OpportunitiesScreen() {
  const [refreshing, setRefreshing] = useState(false)

  const { data: listings, refetch, isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const result = await api.get<{ listings: ListingRow[] }>("/listings?status=PUBLISHED")
      return result.data?.listings ?? []
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  return (
    <SafeAreaView className="flex-1 bg-stadium-950">
      <View className="px-6 py-4 border-b border-stadium-800">
        <Text className="text-white text-lg font-bold">
          Annonces
        </Text>
        <Text className="text-stadium-400 text-sm mt-1">
          Trouvez votre prochaine opportunité
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
