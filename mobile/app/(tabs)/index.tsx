import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import { useState, useCallback } from "react"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "@/stores/auth-store"
import { Role } from "@pfp/shared-constants"

export default function DashboardScreen() {
  const { user } = useAuthStore()
  const [refreshing, setRefreshing] = useState(false)
  const isPlayer = user?.role === Role.PLAYER

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }, [])

  const quickActions = isPlayer
    ? [
        { icon: "search" as const, label: "Chercher", route: "/(tabs)/opportunities" },
        { icon: "document-text" as const, label: "Candidatures", route: "/(tabs)/player/applications" },
        { icon: "people" as const, label: "Agents", route: "/(tabs)/player/agents" },
        { icon: "wallet" as const, label: "Crédits", route: "/(tabs)/player/credits" },
      ]
    : [
        { icon: "search" as const, label: "Opportunités", route: "/(tabs)/opportunities" },
        { icon: "person-add" as const, label: "Soumettre", route: "/(tabs)/agent/submissions" },
        { icon: "document" as const, label: "Mandats", route: "/(tabs)/agent/mandates" },
        { icon: "wallet" as const, label: "Crédits", route: "/(tabs)/agent/credits" },
      ]

  return (
    <SafeAreaView className="flex-1 bg-stadium-950">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        {/* Header */}
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

          {/* Role badge */}
          <View className="flex-row mt-3">
            <View className="bg-pitch-500/15 px-3 py-1 rounded-full">
              <Text className="text-pitch-400 text-xs font-semibold">
                {isPlayer ? "⚽ Joueur" : "🤝 Agent"}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
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

        {/* Stats Cards */}
        <View className="px-6 mb-8">
          <Text className="text-white text-base font-semibold mb-4">
            Statistiques
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-stadium-900 border border-stadium-800 rounded-2xl p-4">
              <Text className="text-stadium-400 text-xs">
                {isPlayer ? "Candidatures" : "Soumissions"}
              </Text>
              <Text className="text-white text-2xl font-bold mt-1">--</Text>
              <Text className="text-stadium-500 text-xs mt-1">Ce mois</Text>
            </View>
            <View className="flex-1 bg-stadium-900 border border-stadium-800 rounded-2xl p-4">
              <Text className="text-stadium-400 text-xs">Vues profil</Text>
              <Text className="text-white text-2xl font-bold mt-1">--</Text>
              <Text className="text-stadium-500 text-xs mt-1">Cette semaine</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
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
