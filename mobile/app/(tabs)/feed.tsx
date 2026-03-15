import { View, Text, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ActivityIndicator } from "react-native"
import { useState, useCallback } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"

interface PostUser {
  id: string
  email?: string
  role?: string
  playerProfile?: { firstName?: string; lastName?: string; displayName?: string; profilePicture?: string }
  agentProfile?: { firstName?: string; lastName?: string; profilePicture?: string }
  clubProfile?: { clubName?: string; logo?: string }
}

interface Post {
  id: string
  content: string
  mediaUrls?: string[]
  createdAt: string
  userId: string
  user: PostUser
  isLiked?: boolean
  _count: { likes: number; comments: number; shares: number }
}

interface PostsResponse {
  posts: Post[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

function getUserName(user: PostUser): string {
  if (user.playerProfile) {
    if (user.playerProfile.displayName) return user.playerProfile.displayName
    const first = user.playerProfile.firstName || ""
    const last = user.playerProfile.lastName || ""
    if (first || last) return `${first} ${last}`.trim()
  }
  if (user.agentProfile) {
    const first = user.agentProfile.firstName || ""
    const last = user.agentProfile.lastName || ""
    if (first || last) return `${first} ${last}`.trim()
  }
  if (user.clubProfile?.clubName) return user.clubProfile.clubName
  return user.email?.split("@")[0] || "Utilisateur"
}

function getUserInitial(user: PostUser): string {
  return getUserName(user).charAt(0).toUpperCase()
}

function FeedPostCard({
  post,
  onLike,
}: {
  post: Post
  onLike: (postId: string, isLiked: boolean) => void
}) {
  return (
    <View className="bg-stadium-900 border border-stadium-800 rounded-2xl mx-4 mb-4 overflow-hidden">
      {/* Post Header */}
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <View className="w-10 h-10 bg-stadium-700 rounded-full items-center justify-center">
          <Text className="text-white text-sm font-bold">
            {getUserInitial(post.user)}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-white text-sm font-semibold">
            {getUserName(post.user)}
          </Text>
          <Text className="text-stadium-500 text-xs">
            {new Date(post.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>

      {/* Post Content */}
      <View className="px-4 pb-3">
        <Text className="text-stadium-200 text-sm leading-5">
          {post.content}
        </Text>
      </View>

      {/* Post Actions */}
      <View className="flex-row border-t border-stadium-800 px-4 py-3">
        <TouchableOpacity
          className="flex-row items-center mr-6"
          onPress={() => onLike(post.id, !!post.isLiked)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.isLiked ? "heart" : "heart-outline"}
            size={18}
            color={post.isLiked ? "#ef4444" : "#71717a"}
          />
          <Text className="text-stadium-400 text-xs ml-1.5">
            {post._count.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center mr-6">
          <Ionicons name="chatbubble-outline" size={16} color="#71717a" />
          <Text className="text-stadium-400 text-xs ml-1.5">
            {post._count.comments}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center">
          <Ionicons name="share-outline" size={16} color="#71717a" />
          <Text className="text-stadium-400 text-xs ml-1.5">
            {post._count.shares}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function FeedScreen() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [postContent, setPostContent] = useState("")

  const { data: posts, refetch, isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: async () => {
      const result = await api.get<PostsResponse>("/posts?limit=20")
      if (result.success && result.data) {
        // L'API retourne { posts, pagination }
        return result.data.posts || []
      }
      return []
    },
  })

  const createPost = useMutation({
    mutationFn: async (content: string) => {
      const result = await api.post("/posts", { content, mediaUrls: [] })
      if (!result.success) throw new Error(result.error || "Erreur lors de la publication")
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
      setPostContent("")
      setShowCreatePost(false)
    },
    onError: (error: Error) => {
      Alert.alert("Erreur", error.message)
    },
  })

  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (isLiked) {
        const result = await api.delete(`/posts/${postId}/like`)
        if (!result.success) throw new Error(result.error || "Erreur")
      } else {
        const result = await api.post(`/posts/${postId}/like`)
        if (!result.success) throw new Error(result.error || "Erreur")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const handleCreatePost = () => {
    if (!postContent.trim()) {
      Alert.alert("Erreur", "Le contenu ne peut pas être vide.")
      return
    }
    createPost.mutate(postContent.trim())
  }

  return (
    <SafeAreaView className="flex-1 bg-stadium-950">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-stadium-800">
        <Text className="text-white text-lg font-bold">Feed</Text>
        <TouchableOpacity
          className="w-9 h-9 bg-stadium-800 rounded-full items-center justify-center"
          onPress={() => setShowCreatePost(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color="#22c55e" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedPostCard
            post={item}
            onLike={(postId, isLiked) => likeMutation.mutate({ postId, isLiked })}
          />
        )}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="newspaper-outline" size={48} color="#3f3f46" />
            <Text className="text-stadium-500 text-sm mt-4">
              {isLoading ? "Chargement..." : "Aucun post pour le moment"}
            </Text>
            {!isLoading && (
              <TouchableOpacity
                className="mt-4 bg-pitch-600 px-6 py-2.5 rounded-xl"
                onPress={() => setShowCreatePost(true)}
                activeOpacity={0.7}
              >
                <Text className="text-white text-sm font-semibold">Publier un post</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Create Post Modal */}
      <Modal visible={showCreatePost} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-stadium-950">
          <SafeAreaView className="flex-1">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-stadium-800">
              <TouchableOpacity onPress={() => { setPostContent(""); setShowCreatePost(false) }}>
                <Text className="text-stadium-400 text-sm">Annuler</Text>
              </TouchableOpacity>
              <Text className="text-white text-base font-semibold">Nouveau post</Text>
              <TouchableOpacity
                onPress={handleCreatePost}
                disabled={createPost.isPending || !postContent.trim()}
              >
                {createPost.isPending ? (
                  <ActivityIndicator color="#22c55e" size="small" />
                ) : (
                  <Text className={`text-sm font-semibold ${postContent.trim() ? "text-pitch-400" : "text-stadium-600"}`}>
                    Publier
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-1 px-4 pt-4">
              <View className="flex-row items-start">
                <View className="w-10 h-10 bg-stadium-700 rounded-full items-center justify-center mr-3">
                  <Text className="text-white text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
                <TextInput
                  className="flex-1 text-white text-base leading-6"
                  value={postContent}
                  onChangeText={setPostContent}
                  placeholder="Quoi de neuf ?"
                  placeholderTextColor="#52525b"
                  multiline
                  autoFocus
                  textAlignVertical="top"
                  style={{ minHeight: 120 }}
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
