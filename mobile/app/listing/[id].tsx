import { useCallback, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

type ListingDetail = {
  id: string
  title?: string | null
  description?: string | null
  position?: string
  status?: string
  publishedAt?: string | null
  consulted?: boolean
  consultationCost?: number
  clubProfile?: {
    id: string
    clubName?: string | null
    country?: string | null
    division?: string | null
    logo?: string | null
  }
  salaryMin?: number | null
  salaryMax?: number | null
  contractType?: string | null
  requirements?: string | null
  _count?: { applications: number; submissions: number } | null
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const listingId = typeof id === "string" ? id : id?.[0] ?? ""

  const { data: listing, refetch, isLoading } = useQuery({
    queryKey: ["listing", listingId],
    enabled: !!listingId,
    queryFn: async () => {
      const result = await api.get<ListingDetail>(`/listings/${listingId}`)
      if (!result.success || !result.data) {
        throw new Error(result.error || "Annonce introuvable")
      }
      return result.data
    },
  })

  const consultMutation = useMutation({
    mutationFn: async () => {
      const result = await api.post(`/credits/listings/${listingId}/consult`)
      if (!result.success) {
        throw new Error(result.error || "Consultation impossible")
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listing", listingId] })
      queryClient.invalidateQueries({ queryKey: ["listings"] })
    },
    onError: (e: Error) => {
      Alert.alert("Erreur", e.message)
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const handleConsult = () => {
    const cost = listing?.consultationCost ?? 0
    Alert.alert(
      "Débloquer l’annonce",
      `Cette consultation coûte ${cost} crédit(s). Continuer ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", onPress: () => consultMutation.mutate() },
      ]
    )
  }

  if (!listingId) {
    return (
      <SafeAreaView className="flex-1 bg-stadium-950 items-center justify-center px-6">
        <Text className="text-stadium-400">Annonce invalide</Text>
      </SafeAreaView>
    )
  }

  if (isLoading && !listing) {
    return (
      <SafeAreaView className="flex-1 bg-stadium-950 items-center justify-center">
        <ActivityIndicator color="#22c55e" />
      </SafeAreaView>
    )
  }

  if (!listing) {
    return (
      <SafeAreaView className="flex-1 bg-stadium-950 px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-6">
          <Ionicons name="chevron-back" size={22} color="#a1a1aa" />
          <Text className="text-stadium-300 ml-1">Retour</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg">Impossible de charger l’annonce</Text>
      </SafeAreaView>
    )
  }

  const clubName = listing.clubProfile?.clubName || "Club"
  const consulted = listing.consulted === true
  const canReadBody = consulted && listing.description

  return (
    <SafeAreaView className="flex-1 bg-stadium-950" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-stadium-800">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center pr-3">
          <Ionicons name="chevron-back" size={22} color="#a1a1aa" />
        </TouchableOpacity>
        <Text className="text-white font-semibold flex-1" numberOfLines={1}>
          Détail annonce
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        <Text className="text-white text-xl font-bold">
          {listing.title || "Annonce"}
        </Text>
        {listing.position ? (
          <View className="bg-pitch-500/15 self-start px-2.5 py-1 rounded-full mt-2">
            <Text className="text-pitch-400 text-xs font-medium">{listing.position}</Text>
          </View>
        ) : null}

        <Text className="text-stadium-400 text-sm mt-4">{clubName}</Text>

        {listing.publishedAt ? (
          <Text className="text-stadium-500 text-xs mt-1">
            Publiée le {new Date(listing.publishedAt).toLocaleDateString("fr-FR")}
          </Text>
        ) : null}

        {canReadBody ? (
          <Text className="text-stadium-200 text-sm leading-6 mt-6">{listing.description}</Text>
        ) : (
          <View className="bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mt-6">
            <Text className="text-stadium-400 text-sm leading-5">
              {consulted
                ? "Aucune description disponible."
                : "Le détail complet de cette annonce est disponible après consultation (crédits)."}
            </Text>
            {!consulted && (
              <TouchableOpacity
                className="bg-pitch-500 rounded-xl py-3 items-center mt-4"
                onPress={handleConsult}
                disabled={consultMutation.isPending}
              >
                {consultMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">
                    Débloquer{listing.consultationCost != null ? ` (${listing.consultationCost} cr.)` : ""}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {consulted && listing._count ? (
          <Text className="text-stadium-500 text-xs mt-6 mb-10">
            {listing._count.applications} candidature(s)
          </Text>
        ) : (
          <View className="h-10" />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
