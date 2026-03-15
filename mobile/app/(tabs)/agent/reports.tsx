import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { useState, useCallback } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface Report {
  id: string
  title?: string
  type?: string
  status: string
  authorType?: string
  content?: string
  createdAt: string
  author?: { name: string }
  subject?: { name: string }
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "bg-stadium-600/15", text: "text-stadium-400" },
  PENDING_APPROVAL: { bg: "bg-gold-500/15", text: "text-gold-400" },
  APPROVED: { bg: "bg-pitch-500/15", text: "text-pitch-400" },
  REJECTED: { bg: "bg-red-500/15", text: "text-red-400" },
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PENDING_APPROVAL: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Refusé",
}

export default function AgentReportsScreen() {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const { data: reports, refetch, isLoading } = useQuery({
    queryKey: ["agent-reports", filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filterStatus) params.set("status", filterStatus)
      const result = await api.get<Report[]>(`/reports?${params}`)
      return Array.isArray(result.data) ? result.data : []
    },
  })

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const result = await api.delete(`/reports/${id}`)
      if (!result.success) throw new Error(result.error || "Erreur")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-reports"] })
    },
    onError: (error: Error) => {
      Alert.alert("Erreur", error.message)
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const stats = {
    total: reports?.length ?? 0,
    draft: reports?.filter((r) => r.status === "DRAFT").length ?? 0,
    pending: reports?.filter((r) => r.status === "PENDING_APPROVAL").length ?? 0,
    approved: reports?.filter((r) => r.status === "APPROVED").length ?? 0,
  }

  const handleDelete = (report: Report) => {
    Alert.alert("Supprimer", "Supprimer ce rapport ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => deleteReport.mutate(report.id) },
    ])
  }

  return (
    <View className="flex-1 bg-stadium-950">
      {/* Stats */}
      <View className="flex-row gap-2 px-4 pt-4 pb-2">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Brouillon", value: stats.draft, color: "text-stadium-400" },
          { label: "En attente", value: stats.pending, color: "text-gold-400" },
          { label: "Approuvé", value: stats.approved, color: "text-pitch-400" },
        ].map((stat) => (
          <View key={stat.label} className="flex-1 bg-stadium-900 border border-stadium-800 rounded-xl p-2.5 items-center">
            <Text className={`text-base font-bold ${stat.color}`}>{stat.value}</Text>
            <Text className="text-stadium-500 text-[10px] mt-0.5">{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <View className="flex-row px-4 py-3 gap-2">
        {[
          { key: null, label: "Tous" },
          { key: "DRAFT", label: "Brouillon" },
          { key: "PENDING_APPROVAL", label: "En attente" },
          { key: "APPROVED", label: "Approuvé" },
        ].map((f) => (
          <TouchableOpacity
            key={f.key || "all"}
            className={`px-3 py-1.5 rounded-lg ${
              filterStatus === f.key ? "bg-pitch-600" : "bg-stadium-800"
            }`}
            onPress={() => setFilterStatus(f.key)}
          >
            <Text className={`text-xs font-medium ${filterStatus === f.key ? "text-white" : "text-stadium-400"}`}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
        renderItem={({ item }) => {
          const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.DRAFT
          return (
            <View className="bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                    {item.title || "Rapport sans titre"}
                  </Text>
                  {item.subject && (
                    <Text className="text-stadium-400 text-xs mt-0.5">
                      Sujet : {item.subject.name}
                    </Text>
                  )}
                </View>
                <View className={`${statusStyle.bg} px-2.5 py-1 rounded-full`}>
                  <Text className={`${statusStyle.text} text-xs font-medium`}>
                    {STATUS_LABELS[item.status] || item.status}
                  </Text>
                </View>
              </View>
              <Text className="text-stadium-600 text-xs mt-2">
                {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>

              {item.status === "DRAFT" && (
                <View className="mt-3 pt-3 border-t border-stadium-800">
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    className="flex-row items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                    <Text className="text-red-400 text-xs font-medium ml-1">Supprimer</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        }}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="analytics-outline" size={48} color="#3f3f46" />
            <Text className="text-stadium-500 text-sm mt-4">
              {isLoading ? "Chargement..." : "Aucun rapport"}
            </Text>
          </View>
        }
      />
    </View>
  )
}
