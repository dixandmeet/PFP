import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native"
import { useState, useCallback, useMemo } from "react"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"

type ParticipantUser = {
  id: string
  name: string | null
  playerProfile?: { firstName?: string; lastName?: string }
  agentProfile?: { firstName?: string; lastName?: string }
  clubProfile?: { clubName?: string }
}

type ApiParticipant = {
  userId: string
  lastReadAt?: string | null
  user: ParticipantUser
}

type ApiConversation = {
  id: string
  lastMessageAt: string | null
  participants: ApiParticipant[]
  messages: Array<{ content: string | null; createdAt: string }>
}

export interface ConversationRow {
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

function displayName(user: ParticipantUser): string {
  if (user.name) return user.name
  if (user.playerProfile) {
    const f = user.playerProfile.firstName || ""
    const l = user.playerProfile.lastName || ""
    const n = `${f} ${l}`.trim()
    if (n) return n
  }
  if (user.agentProfile) {
    const f = user.agentProfile.firstName || ""
    const l = user.agentProfile.lastName || ""
    const n = `${f} ${l}`.trim()
    if (n) return n
  }
  if (user.clubProfile?.clubName) return user.clubProfile.clubName
  return "Utilisateur"
}

function mapConversations(raw: ApiConversation[], currentUserId: string | undefined): ConversationRow[] {
  if (!currentUserId) return []
  return raw
    .map((conv) => {
      const otherParticipant = conv.participants.find((p) => p.user.id !== currentUserId)
      if (!otherParticipant) return null
      const last = conv.messages[0]
      const lastMsgTime = conv.lastMessageAt ? new Date(conv.lastMessageAt).getTime() : 0
      const myPart = conv.participants.find((p) => p.userId === currentUserId)
      const readTime = myPart?.lastReadAt ? new Date(myPart.lastReadAt).getTime() : 0
      const unreadCount = lastMsgTime > readTime && lastMsgTime > 0 ? 1 : 0
      const u = otherParticipant.user
      return {
        id: conv.id,
        lastMessage: last?.content ?? null,
        lastMessageAt: conv.lastMessageAt,
        otherUser: {
          id: u.id,
          name: displayName(u),
          image: null,
        },
        unreadCount,
      }
    })
    .filter(Boolean) as ConversationRow[]
}

function ConversationItem({ conversation }: { conversation: ConversationRow }) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-6 py-4 border-b border-stadium-800/50"
      activeOpacity={0.7}
      onPress={() => router.push(`/conversation/${conversation.id}`)}
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
  const currentUserId = useAuthStore((s) => s.user?.id)

  const { data: conversations, refetch, isLoading } = useQuery({
    queryKey: ["conversations", currentUserId],
    enabled: !!currentUserId,
    queryFn: async () => {
      const result = await api.get<{ conversations: ApiConversation[] }>("/messages/conversations")
      const raw = result.data?.conversations ?? []
      return mapConversations(raw, currentUserId)
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const list = useMemo(() => conversations ?? [], [conversations])

  return (
    <SafeAreaView className="flex-1 bg-stadium-950">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-stadium-800">
        <Text className="text-white text-lg font-bold">Messages</Text>
        <TouchableOpacity className="w-9 h-9 bg-stadium-800 rounded-full items-center justify-center" disabled>
          <Ionicons name="create-outline" size={18} color="#52525b" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={list}
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
