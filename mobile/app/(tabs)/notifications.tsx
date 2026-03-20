import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native"
import { useState, useCallback } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: string
}

const NOTIFICATION_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  MANDATE_REQUEST: "document-text",
  MANDATE_ACCEPTED: "checkmark-circle",
  MANDATE_REJECTED: "close-circle",
  APPLICATION_RECEIVED: "mail",
  SUBMISSION_RECEIVED: "send",
  LISTING_NEW: "briefcase",
  REPORT_SHARED: "analytics",
  POST_LIKE: "heart",
  POST_COMMENT: "chatbubble",
  FOLLOW: "person-add",
  AI_ACTION_COMPLETED: "checkmark-done",
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
}) {
  const iconName = NOTIFICATION_ICONS[notification.type] || "notifications"

  return (
    <TouchableOpacity
      className={`flex-row px-4 py-4 border-b border-stadium-800 ${
        !notification.read ? "bg-stadium-900/50" : ""
      }`}
      onPress={() => !notification.read && onMarkAsRead(notification.id)}
      activeOpacity={0.7}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          !notification.read ? "bg-pitch-500/15" : "bg-stadium-800"
        }`}
      >
        <Ionicons
          name={iconName}
          size={18}
          color={!notification.read ? "#22c55e" : "#71717a"}
        />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-sm font-semibold flex-1 mr-2 ${
              !notification.read ? "text-white" : "text-stadium-300"
            }`}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          {!notification.read && (
            <View className="w-2 h-2 bg-pitch-500 rounded-full" />
          )}
        </View>
        <Text className="text-stadium-400 text-xs mt-1" numberOfLines={2}>
          {notification.message}
        </Text>
        <Text className="text-stadium-600 text-xs mt-1">
          {new Date(notification.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const queryClient = useQueryClient()

  const { data: notifications, refetch, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const result = await api.get<Notification[]>("/notifications")
      return Array.isArray(result.data) ? result.data : []
    },
  })

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}`, { read: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const unread = notifications?.filter((n) => !n.read) || []
      await Promise.all(unread.map((n) => api.patch(`/notifications/${n.id}`, { read: true })))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <SafeAreaView className="flex-1 bg-stadium-950">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-stadium-800">
        <Text className="text-white text-lg font-bold">Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={() => markAllAsRead.mutate()}
            activeOpacity={0.7}
          >
            <Text className="text-pitch-400 text-sm font-medium">
              Tout marquer comme lu
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onMarkAsRead={(id) => markAsRead.mutate(id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="notifications-off-outline" size={48} color="#3f3f46" />
            <Text className="text-stadium-500 text-sm mt-4">
              {isLoading ? "Chargement..." : "Aucune notification"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
