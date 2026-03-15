import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl } from "react-native"
import { useState, useCallback } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import { Role } from "@pfp/shared-constants"

type TabType = "listings" | "clubs" | "profiles"

interface Listing {
  id: string
  title: string
  club?: { name: string }
  position?: string
  location?: string
  level?: string
  createdAt: string
}

interface Club {
  id: string
  name: string
  country?: string
  city?: string
  league?: string
  status?: string
}

interface Profile {
  id: string
  user: { name: string; role: string }
  position?: string
  nationality?: string
  currentClub?: string
  agencyName?: string
  isVerified?: boolean
}

export default function SearchScreen() {
  const { user } = useAuthStore()
  const isPlayer = user?.role === Role.PLAYER
  const [activeTab, setActiveTab] = useState<TabType>("listings")
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const tabs: { key: TabType; label: string }[] = [
    { key: "listings", label: "Annonces" },
    { key: "clubs", label: "Clubs" },
    { key: "profiles", label: isPlayer ? "Agents" : "Joueurs" },
  ]

  const { data: listings, refetch: refetchListings } = useQuery({
    queryKey: ["search-listings", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ status: "PUBLISHED" })
      if (searchQuery) params.set("search", searchQuery)
      const result = await api.get<Listing[]>(`/listings?${params}`)
      return Array.isArray(result.data) ? result.data : []
    },
    enabled: activeTab === "listings",
  })

  const { data: clubs, refetch: refetchClubs } = useQuery({
    queryKey: ["search-clubs", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)
      const result = await api.get<Club[]>(`/clubs?${params}`)
      return Array.isArray(result.data) ? result.data : []
    },
    enabled: activeTab === "clubs",
  })

  const { data: profiles, refetch: refetchProfiles } = useQuery({
    queryKey: ["search-profiles", searchQuery, isPlayer],
    queryFn: async () => {
      const endpoint = isPlayer ? "/agents" : "/players"
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)
      const result = await api.get<Profile[]>(`${endpoint}?${params}`)
      return Array.isArray(result.data) ? result.data : []
    },
    enabled: activeTab === "profiles",
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    if (activeTab === "listings") await refetchListings()
    else if (activeTab === "clubs") await refetchClubs()
    else await refetchProfiles()
    setRefreshing(false)
  }, [activeTab, refetchListings, refetchClubs, refetchProfiles])

  const renderListing = ({ item }: { item: Listing }) => (
    <View className="bg-stadium-900 border border-stadium-800 rounded-2xl mx-4 mb-3 p-4">
      <Text className="text-white text-sm font-semibold">{item.title}</Text>
      {item.club && (
        <Text className="text-stadium-400 text-xs mt-1">{item.club.name}</Text>
      )}
      <View className="flex-row mt-2 gap-2">
        {item.position && (
          <View className="bg-pitch-500/15 px-2 py-0.5 rounded-full">
            <Text className="text-pitch-400 text-xs">{item.position}</Text>
          </View>
        )}
        {item.location && (
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={12} color="#71717a" />
            <Text className="text-stadium-500 text-xs ml-1">{item.location}</Text>
          </View>
        )}
      </View>
    </View>
  )

  const renderClub = ({ item }: { item: Club }) => (
    <View className="bg-stadium-900 border border-stadium-800 rounded-2xl mx-4 mb-3 p-4">
      <Text className="text-white text-sm font-semibold">{item.name}</Text>
      <View className="flex-row items-center mt-1">
        {item.country && (
          <Text className="text-stadium-400 text-xs">{item.country}</Text>
        )}
        {item.city && (
          <Text className="text-stadium-500 text-xs ml-2">{item.city}</Text>
        )}
      </View>
      {item.league && (
        <Text className="text-stadium-500 text-xs mt-1">{item.league}</Text>
      )}
    </View>
  )

  const renderProfile = ({ item }: { item: Profile }) => (
    <View className="bg-stadium-900 border border-stadium-800 rounded-2xl mx-4 mb-3 p-4">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-stadium-700 rounded-full items-center justify-center mr-3">
          <Text className="text-white text-sm font-bold">
            {item.user?.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-white text-sm font-semibold">
              {item.user?.name || "Inconnu"}
            </Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color="#22c55e" className="ml-1" />
            )}
          </View>
          <Text className="text-stadium-400 text-xs mt-0.5">
            {item.position || item.agencyName || ""}
          </Text>
        </View>
      </View>
      {(item.nationality || item.currentClub) && (
        <View className="flex-row mt-2 gap-3">
          {item.nationality && (
            <Text className="text-stadium-500 text-xs">{item.nationality}</Text>
          )}
          {item.currentClub && (
            <Text className="text-stadium-500 text-xs">{item.currentClub}</Text>
          )}
        </View>
      )}
    </View>
  )

  const getData = () => {
    if (activeTab === "listings") return listings || []
    if (activeTab === "clubs") return clubs || []
    return profiles || []
  }

  const getRenderItem = () => {
    if (activeTab === "listings") return renderListing as any
    if (activeTab === "clubs") return renderClub as any
    return renderProfile as any
  }

  return (
    <SafeAreaView className="flex-1 bg-stadium-950">
      {/* Header */}
      <View className="px-6 py-4 border-b border-stadium-800">
        <Text className="text-white text-lg font-bold mb-4">Recherche</Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-stadium-800 rounded-xl px-4 py-2.5 border border-stadium-700">
          <Ionicons name="search" size={18} color="#71717a" />
          <TextInput
            className="flex-1 text-white text-sm ml-2"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher..."
            placeholderTextColor="#52525b"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#71717a" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row mt-4 gap-2">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 py-2 rounded-lg items-center ${
                activeTab === tab.key
                  ? "bg-pitch-600"
                  : "bg-stadium-800"
              }`}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-xs font-semibold ${
                  activeTab === tab.key ? "text-white" : "text-stadium-400"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={getData()}
        keyExtractor={(item: any) => item.id}
        renderItem={getRenderItem()}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="search-outline" size={48} color="#3f3f46" />
            <Text className="text-stadium-500 text-sm mt-4">Aucun résultat</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
