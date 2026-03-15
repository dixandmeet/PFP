import { Redirect, Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "@/stores/auth-store"
import { Role } from "@pfp/shared-constants"

type TabIcon = React.ComponentProps<typeof Ionicons>["name"]

export default function TabsLayout() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />
  }

  const isPlayer = user.role === Role.PLAYER
  const isAgent = user.role === Role.AGENT

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#71717a",
        tabBarStyle: {
          backgroundColor: "#18181b",
          borderTopColor: "#27272a",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="newspaper" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="opportunities"
        options={{
          title: isPlayer ? "Annonces" : "Opportunités",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden routes for sub-navigation */}
      <Tabs.Screen name="player" options={{ href: null }} />
      <Tabs.Screen name="agent" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  )
}
