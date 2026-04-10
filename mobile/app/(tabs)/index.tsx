import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import { useState, useCallback } from "react"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { startOfMonth } from "date-fns"
import { useAuthStore } from "@/stores/auth-store"
import { api } from "@/lib/api"

export default function DashboardScreen() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const { data: appsThisMonth } = useQuery({
    queryKey: ["dashboard-applications-month"],
    queryFn: async () => {
      const res = await api.get<{ applications: Array<{ createdAt: string }> }>("/applications")
      if (!res.success || !res.data?.applications) return null
      const start = startOfMonth(new Date())
      return res.data.applications.filter((a) => new Date(a.createdAt) >= start).length
    },
  })

  const { data: profileViewsTotal } = useQuery({
    queryKey: ["dashboard-profile-views-total"],
    queryFn: async () => {
      const res = await api.get<{ total: number }>("/profile-views?page=1&limit=1")
      if (!res.success || res.data == null) return null
      return typeof res.data.total === "number" ? res.data.total : null
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard-applications-month"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard-profile-views-total"] }),
    ])
    setRefreshing(false)
  }, [queryClient])

  const quickActions = [
    { icon: "search" as const, label: "Chercher", route: "/(tabs)/opportunities" },
    { icon: "document-text" as const, label: "Candidatures", route: "/(tabs)/player/applications" },
    { icon: "people" as const, label: "Agents", route: "/(tabs)/player/agents" },
    { icon: "wallet" as const, label: "Crédits", route: "/(tabs)/player/credits" },
  ]

  return (
    <SafeAreaView className="flex-1 bg-stadium-950">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-stadium-400 text-sm">
                Bonjour 👋
              </Text>
              <Text className="text-white text-xl font-bold mt-1">
                {user?.name || "Utilisateur"}
              </Text>
            </View>
            <TouchableOpacity
              className="w-10 h-10 bg-stadium-800 rounded-full items-center justify-center"
              onPress={() => router.push("/(tabs)/notifications")}
            >
              <Ionicons name="notifications-outline" size={20} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          <View className="flex-row mt-3">
            <View className="bg-pitch-500/15 px-3 py-1 rounded-full">
              <Text className="text-pitch-400 text-xs font-semibold">
                Joueur
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 mb-8">
          <Text className="text-white text-base font-semibold mb-4">
            Actions rapides
          </Text>
          <View className="flex-row gap-3">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                className="flex-1 bg-stadium-900 border border-stadium-800 rounded-2xl py-4 items-center"
                onPress={() => router.push(action.route as never)}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 bg-stadium-800 rounded-xl items-center justify-center mb-2">
                  <Ionicons name={action.icon} size={20} color="#22c55e" />
                </View>
                <Text className="text-stadium-200 text-xs font-medium">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="px-6 mb-8">
          <Text className="text-white text-base font-semibold mb-4">
            Statistiques
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-stadium-900 border border-stadium-800 rounded-2xl p-4">
              <Text className="text-stadium-400 text-xs">
                Candidatures
              </Text>
              <Text className="text-white text-2xl font-bold mt-1">
                {appsThisMonth == null ? "—" : String(appsThisMonth)}
              </Text>
              <Text className="text-stadium-500 text-xs mt-1">Ce mois</Text>
            </View>
            <View className="flex-1 bg-stadium-900 border border-stadium-800 rounded-2xl p-4">
              <Text className="text-stadium-400 text-xs">Vues profil</Text>
              <Text className="text-white text-2xl font-bold mt-1">
                {profileViewsTotal == null ? "—" : String(profileViewsTotal)}
              </Text>
              <Text className="text-stadium-500 text-xs mt-1">Au total</Text>
            </View>
          </View>
        </View>

        <View className="px-6 mb-8">
          <Text className="text-white text-base font-semibold mb-4">
            Activité récente
          </Text>
          <View className="bg-stadium-900 border border-stadium-800 rounded-2xl p-6 items-center">
            <Ionicons name="time-outline" size={32} color="#71717a" />
            <Text className="text-stadium-400 text-sm mt-3 text-center">
              Vos activités récentes apparaîtront ici
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
