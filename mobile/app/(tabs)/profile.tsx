import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "@/stores/auth-store"
import { Role } from "@pfp/shared-constants"

export default function ProfileScreen() {
  const { user, logout } = useAuthStore()
  const isPlayer = user?.role === Role.PLAYER

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout()
          router.replace("/(auth)/login")
        },
      },
    ])
  }

  const menuSections = [
    {
      title: "Profil",
      items: [
        {
          icon: "person-outline" as const,
          label: "Modifier mon profil",
          route: isPlayer ? "/(tabs)/player/edit-profile" : "/(tabs)/agent/edit-profile",
        },
        {
          icon: "shield-checkmark-outline" as const,
          label: "Vérification",
          route: "/(tabs)/profile",
        },
      ],
    },
    {
      title: isPlayer ? "Football" : "Gestion",
      items: isPlayer
        ? [
            { icon: "football-outline" as const, label: "Ma carrière", route: "/(tabs)/player/career" },
            { icon: "document-text-outline" as const, label: "Mes candidatures", route: "/(tabs)/player/applications" },
            { icon: "people-outline" as const, label: "Mes agents", route: "/(tabs)/player/agents" },
            { icon: "analytics-outline" as const, label: "Mes rapports", route: "/(tabs)/player/reports" },
            { icon: "search-outline" as const, label: "Recherche", route: "/(tabs)/search" },
          ]
        : [
            { icon: "people-outline" as const, label: "Mes joueurs", route: "/(tabs)/agent/players" },
            { icon: "send-outline" as const, label: "Mes soumissions", route: "/(tabs)/agent/submissions" },
            { icon: "document-outline" as const, label: "Mes mandats", route: "/(tabs)/agent/mandates" },
            { icon: "analytics-outline" as const, label: "Mes rapports", route: "/(tabs)/agent/reports" },
            { icon: "search-outline" as const, label: "Recherche", route: "/(tabs)/search" },
          ],
    },
    {
      title: "Compte",
      items: [
        { icon: "wallet-outline" as const, label: "Crédits", route: isPlayer ? "/(tabs)/player/credits" : "/(tabs)/agent/credits" },
        { icon: "notifications-outline" as const, label: "Notifications", route: "/(tabs)/notifications" },
        { icon: "settings-outline" as const, label: "Paramètres", route: "/(tabs)/settings" },
        { icon: "help-circle-outline" as const, label: "Support", route: "/(tabs)/settings" },
      ],
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-stadium-950">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="px-6 pt-4 pb-8 items-center">
          <View className="w-20 h-20 bg-stadium-700 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
          <Text className="text-white text-xl font-bold">
            {user?.name || "Utilisateur"}
          </Text>
          <Text className="text-stadium-400 text-sm mt-1">
            {user?.email}
          </Text>
          <View className="bg-pitch-500/15 px-3 py-1 rounded-full mt-3">
            <Text className="text-pitch-400 text-xs font-semibold">
              {isPlayer ? "⚽ Joueur" : "🤝 Agent"}
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} className="mb-6">
            <Text className="text-stadium-500 text-xs font-semibold uppercase tracking-wider px-6 mb-2">
              {section.title}
            </Text>
            <View className="mx-4 bg-stadium-900 rounded-2xl border border-stadium-800 overflow-hidden">
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  className={`flex-row items-center px-4 py-3.5 ${
                    idx < section.items.length - 1 ? "border-b border-stadium-800" : ""
                  }`}
                  onPress={() => router.push(item.route as never)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={item.icon} size={20} color="#a1a1aa" />
                  <Text className="text-white text-sm flex-1 ml-3">{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#52525b" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <View className="mx-4 mb-12">
          <TouchableOpacity
            className="bg-red-500/10 border border-red-500/20 rounded-2xl py-3.5 items-center"
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text className="text-red-400 text-sm font-semibold">
              Se déconnecter
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
