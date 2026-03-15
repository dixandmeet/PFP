import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native"
import { useState, useCallback } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface Conversation {
  id: string
  lastMessage: string | null
  lastMessageAt: string | null
  otherUser: {
    id: string
    name: string | null
    image: string | null
  }
  unreadCount: number
}

function ConversationItem({ conversation }: { conversation: Conversation }) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-6 py-4 border-b border-stadium-800/50"
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 bg-stadium-700 rounded-full items-center justify-center">
        <Text className="text-white text-base font-bold">
          {conversation.otherUser.name?.charAt(0)?.toUpperCase() || "?"}
        </Text>
      </View>

      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-sm font-semibold">
            {conversation.otherUser.name || "Utilisateur"}
          </Text>
          {conversation.lastMessageAt && (
            <Text className="text-stadium-500 text-xs">
              {new Date(conversation.lastMessageAt).toLocaleDateString("fr-FR")}
            </Text>
          )}
        </View>
        <Text className="text-stadium-400 text-sm mt-0.5" numberOfLines={1}>
          {conversation.lastMessage || "Pas encore de message"}
        </Text>
      </View>

      {conversation.unreadCount > 0 && (
        <View className="bg-pitch-500 w-5 h-5 rounded-full items-center justify-center ml-2">
          <Text className="text-white text-xs font-bold">
            {conversation.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default function MessagesScreen() {
  const [refreshing, setRefreshing] = useState(false)

  const { data: conversations, refetch, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const result = await api.get<Conversation[]>("/messages/conversations")
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
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-stadium-800">
        <Text className="text-white text-lg font-bold">Messages</Text>
        <TouchableOpacity className="w-9 h-9 bg-stadium-800 rounded-full items-center justify-center">
          <Ionicons name="create-outline" size={18} color="#22c55e" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversationItem conversation={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="chatbubbles-outline" size={48} color="#3f3f46" />
            <Text className="text-stadium-500 text-sm mt-4">
              {isLoading ? "Chargement..." : "Aucune conversation"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
