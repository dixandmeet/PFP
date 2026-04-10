import { useCallback, useState } from "react"
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"

type ParticipantUser = {
  id: string
  name: string | null
  playerProfile?: { firstName?: string; lastName?: string }
  agentProfile?: { firstName?: string; lastName?: string }
  clubProfile?: { clubName?: string }
}

type ApiMessage = {
  id: string
  content: string | null
  createdAt: string
  senderId: string
  sender: ParticipantUser
}

function titleForUser(user: ParticipantUser): string {
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
  return "Conversation"
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const myId = useAuthStore((s) => s.user?.id)
  const [draft, setDraft] = useState("")

  const conversationId = typeof id === "string" ? id : id?.[0] ?? ""

  const { data: meta } = useQuery({
    queryKey: ["conversation-meta", conversationId, myId],
    enabled: !!conversationId && !!myId,
    queryFn: async () => {
      const result = await api.get<{ conversation: { participants: Array<{ user: ParticipantUser }> } }>(
        `/messages/conversations/${conversationId}`
      )
      if (!result.success || !result.data?.conversation) return null
      const other = result.data.conversation.participants.find((p) => p.user.id !== myId)?.user
      return { title: other ? titleForUser(other) : "Messages" }
    },
  })

  const { data: messages, isLoading } = useQuery({
    queryKey: ["conversation-messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const result = await api.get<{ messages: ApiMessage[] }>(
        `/messages/conversations/${conversationId}/messages`
      )
      return result.data?.messages ?? []
    },
  })

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const result = await api.post(`/messages/conversations/${conversationId}/messages`, { content })
      if (!result.success) throw new Error(result.error || "Envoi impossible")
      return result.data
    },
    onSuccess: () => {
      setDraft("")
      queryClient.invalidateQueries({ queryKey: ["conversation-messages", conversationId] })
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })

  const renderItem = useCallback(
    ({ item }: { item: ApiMessage }) => {
      const mine = item.senderId === myId
      return (
        <View className={`mb-3 max-w-[85%] ${mine ? "self-end" : "self-start"}`}>
          <View
            className={`rounded-2xl px-3 py-2 ${mine ? "bg-pitch-600" : "bg-stadium-800"}`}
          >
            <Text className="text-white text-sm leading-5">{item.content || " "}</Text>
          </View>
          <Text className="text-stadium-600 text-[10px] mt-1 px-1">
            {new Date(item.createdAt).toLocaleString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      )
    },
    [myId]
  )

  if (!conversationId) {
    return (
      <SafeAreaView className="flex-1 bg-stadium-950 items-center justify-center">
        <Text className="text-stadium-400">Conversation invalide</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-stadium-950" edges={["top"]}>
      <View className="flex-row items-center px-3 py-2 border-b border-stadium-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={22} color="#a1a1aa" />
        </TouchableOpacity>
        <Text className="text-white font-semibold flex-1" numberOfLines={1}>
          {meta?.title || "Messages"}
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#22c55e" />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            ListEmptyComponent={
              <Text className="text-stadium-500 text-sm text-center py-8">Aucun message pour l’instant</Text>
            }
          />
        )}

        <View className="flex-row items-end px-3 pb-3 pt-2 border-t border-stadium-800 gap-2">
          <TextInput
            className="flex-1 bg-stadium-900 border border-stadium-700 rounded-xl px-3 py-2.5 text-white text-sm max-h-28"
            placeholder="Votre message…"
            placeholderTextColor="#71717a"
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            className="bg-pitch-500 rounded-xl px-4 py-3"
            disabled={!draft.trim() || sendMutation.isPending}
            onPress={() => sendMutation.mutate(draft.trim())}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
