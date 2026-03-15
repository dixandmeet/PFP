import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, RefreshControl, ActivityIndicator } from "react-native"
import { useState, useCallback } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface Player {
  id: string
  firstName?: string
  lastName?: string
  position?: string
  nationality?: string
  currentClub?: string
  dateOfBirth?: string
  user: { id: string; name: string }
}

interface Mandate {
  id: string
  status: string
  startDate?: string
  endDate?: string
  terms?: string
  player: { id: string; user: { name: string }; position?: string; currentClub?: string }
  createdAt: string
}

type TabType = "players" | "mandates"

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-gold-500/15", text: "text-gold-400" },
  ACTIVE: { bg: "bg-pitch-500/15", text: "text-pitch-400" },
  EXPIRED: { bg: "bg-stadium-600/15", text: "text-stadium-400" },
  TERMINATED: { bg: "bg-red-500/15", text: "text-red-400" },
  REJECTED: { bg: "bg-red-500/15", text: "text-red-400" },
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACTIVE: "Actif",
  EXPIRED: "Expiré",
  TERMINATED: "Résilié",
  REJECTED: "Refusé",
}

export default function AgentPlayersScreen() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>("players")
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateMandate, setShowCreateMandate] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState("")
  const [mandateStartDate, setMandateStartDate] = useState("")
  const [mandateEndDate, setMandateEndDate] = useState("")
  const [mandateTerms, setMandateTerms] = useState("")

  const { data: mandates, refetch: refetchMandates, isLoading: loadingMandates } = useQuery({
    queryKey: ["agent-mandates"],
    queryFn: async () => {
      const result = await api.get<Mandate[]>("/mandates")
      return Array.isArray(result.data) ? result.data : []
    },
  })

  const { data: players, refetch: refetchPlayers, isLoading: loadingPlayers } = useQuery({
    queryKey: ["all-players", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" })
      if (searchQuery) params.set("search", searchQuery)
      const result = await api.get<Player[]>(`/players?${params}`)
      return Array.isArray(result.data) ? result.data : []
    },
  })

  const createMandate = useMutation({
    mutationFn: async () => {
      if (!selectedPlayerId) throw new Error("Veuillez sélectionner un joueur.")
      const body: Record<string, any> = {
        playerId: selectedPlayerId,
        startDate: mandateStartDate || undefined,
        endDate: mandateEndDate || undefined,
        terms: mandateTerms || undefined,
      }
      const result = await api.post("/mandates", body)
      if (!result.success) throw new Error(result.error || "Erreur")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-mandates"] })
      setShowCreateMandate(false)
      setSelectedPlayerId("")
      setMandateStartDate("")
      setMandateEndDate("")
      setMandateTerms("")
      Alert.alert("Succès", "Demande de mandat envoyée.")
    },
    onError: (error: Error) => {
      Alert.alert("Erreur", error.message)
    },
  })

  const updateMandateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const result = await api.patch(`/mandates/${id}/status`, { status })
      if (!result.success) throw new Error(result.error || "Erreur")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-mandates"] })
    },
    onError: (error: Error) => {
      Alert.alert("Erreur", error.message)
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    if (activeTab === "players") await refetchPlayers()
    else await refetchMandates()
    setRefreshing(false)
  }, [activeTab, refetchPlayers, refetchMandates])

  const activeMandatePlayerIds = new Set(
    mandates?.filter((m) => m.status === "ACTIVE").map((m) => m.player?.id) || []
  )

  const calculateAge = (dob?: string) => {
    if (!dob) return null
    const diff = Date.now() - new Date(dob).getTime()
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
  }

  // Stats
  const activePlayers = mandates?.filter((m) => m.status === "ACTIVE").length ?? 0
  const pendingMandates = mandates?.filter((m) => m.status === "PENDING").length ?? 0

  return (
    <ScrollView
      className="flex-1 bg-stadium-950"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
      }
    >
      {/* Stats */}
      <View className="flex-row gap-2 px-4 pt-4">
        <View className="flex-1 bg-stadium-900 border border-stadium-800 rounded-xl p-3 items-center">
          <Text className="text-white text-lg font-bold">{activePlayers}</Text>
          <Text className="text-stadium-500 text-xs">Joueurs actifs</Text>
        </View>
        <View className="flex-1 bg-stadium-900 border border-stadium-800 rounded-xl p-3 items-center">
          <Text className="text-white text-lg font-bold">{pendingMandates}</Text>
          <Text className="text-stadium-500 text-xs">En attente</Text>
        </View>
        <View className="flex-1 bg-stadium-900 border border-stadium-800 rounded-xl p-3 items-center">
          <Text className="text-white text-lg font-bold">{mandates?.length ?? 0}</Text>
          <Text className="text-stadium-500 text-xs">Total mandats</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-4 mt-4 gap-2">
        {[
          { key: "players" as TabType, label: "Joueurs" },
          { key: "mandates" as TabType, label: "Mandats" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === tab.key ? "bg-pitch-600" : "bg-stadium-800"
            }`}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text className={`text-xs font-semibold ${activeTab === tab.key ? "text-white" : "text-stadium-400"}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="px-4 mt-4 mb-8">
        {activeTab === "players" && (
          <>
            {/* Search */}
            <View className="flex-row items-center bg-stadium-800 rounded-xl px-4 py-2.5 border border-stadium-700 mb-4">
              <Ionicons name="search" size={18} color="#71717a" />
              <TextInput
                className="flex-1 text-white text-sm ml-2"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher un joueur..."
                placeholderTextColor="#52525b"
              />
            </View>

            {/* Create Mandate Button */}
            <TouchableOpacity
              className="bg-pitch-600 rounded-xl py-3 flex-row items-center justify-center mb-4"
              onPress={() => setShowCreateMandate(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text className="text-white text-sm font-semibold ml-1">Créer un mandat</Text>
            </TouchableOpacity>

            {loadingPlayers && (
              <View className="items-center py-12">
                <ActivityIndicator color="#22c55e" />
              </View>
            )}

            {!loadingPlayers && (!players || players.length === 0) && (
              <View className="bg-stadium-900 border border-stadium-800 rounded-2xl p-6 items-center">
                <Ionicons name="people-outline" size={40} color="#3f3f46" />
                <Text className="text-stadium-500 text-sm mt-3">Aucun joueur trouvé</Text>
              </View>
            )}

            {players?.map((player) => {
              const age = calculateAge(player.dateOfBirth)
              const hasMandate = activeMandatePlayerIds.has(player.id)
              return (
                <View key={player.id} className="bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-3">
                  <View className="flex-row items-center">
                    <View className="w-11 h-11 bg-stadium-700 rounded-full items-center justify-center mr-3">
                      <Text className="text-white text-sm font-bold">
                        {player.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-white text-sm font-semibold">{player.user?.name}</Text>
                        {hasMandate && (
                          <Ionicons name="link" size={12} color="#22c55e" style={{ marginLeft: 4 }} />
                        )}
                      </View>
                      <View className="flex-row items-center mt-0.5 gap-2">
                        {player.position && (
                          <Text className="text-pitch-400 text-xs">{player.position}</Text>
                        )}
                        {age && <Text className="text-stadium-500 text-xs">{age} ans</Text>}
                        {player.nationality && (
                          <Text className="text-stadium-500 text-xs">{player.nationality}</Text>
                        )}
                      </View>
                      {player.currentClub && (
                        <Text className="text-stadium-500 text-xs mt-0.5">{player.currentClub}</Text>
                      )}
                    </View>
                  </View>
                </View>
              )
            })}
          </>
        )}

        {activeTab === "mandates" && (
          <>
            {loadingMandates && (
              <View className="items-center py-12">
                <ActivityIndicator color="#22c55e" />
              </View>
            )}
            {!loadingMandates && (!mandates || mandates.length === 0) && (
              <View className="bg-stadium-900 border border-stadium-800 rounded-2xl p-6 items-center">
                <Ionicons name="document-text-outline" size={40} color="#3f3f46" />
                <Text className="text-stadium-500 text-sm mt-3">Aucun mandat</Text>
              </View>
            )}
            {mandates?.map((mandate) => {
              const statusStyle = STATUS_COLORS[mandate.status] || STATUS_COLORS.PENDING
              return (
                <View key={mandate.id} className="bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-3">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-white text-sm font-semibold">
                        {mandate.player?.user?.name}
                      </Text>
                      {mandate.player?.position && (
                        <Text className="text-stadium-400 text-xs mt-0.5">{mandate.player.position}</Text>
                      )}
                    </View>
                    <View className={`${statusStyle.bg} px-2.5 py-1 rounded-full`}>
                      <Text className={`${statusStyle.text} text-xs font-medium`}>
                        {STATUS_LABELS[mandate.status] || mandate.status}
                      </Text>
                    </View>
                  </View>
                  {(mandate.startDate || mandate.endDate) && (
                    <View className="flex-row mt-2 gap-3">
                      {mandate.startDate && (
                        <Text className="text-stadium-500 text-xs">
                          Du {new Date(mandate.startDate).toLocaleDateString("fr-FR")}
                        </Text>
                      )}
                      {mandate.endDate && (
                        <Text className="text-stadium-500 text-xs">
                          au {new Date(mandate.endDate).toLocaleDateString("fr-FR")}
                        </Text>
                      )}
                    </View>
                  )}
                  {mandate.status === "ACTIVE" && (
                    <View className="mt-3 pt-3 border-t border-stadium-800">
                      <TouchableOpacity
                        className="bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 items-center"
                        onPress={() => {
                          Alert.alert("Résilier", "Résilier ce mandat ?", [
                            { text: "Annuler", style: "cancel" },
                            {
                              text: "Résilier",
                              style: "destructive",
                              onPress: () => updateMandateStatus.mutate({ id: mandate.id, status: "TERMINATED" }),
                            },
                          ])
                        }}
                        activeOpacity={0.7}
                      >
                        <Text className="text-red-400 text-xs font-semibold">Résilier</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )
            })}
          </>
        )}
      </View>

      {/* Create Mandate Modal */}
      <Modal visible={showCreateMandate} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-stadium-950">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-stadium-800">
            <TouchableOpacity onPress={() => setShowCreateMandate(false)}>
              <Text className="text-stadium-400 text-sm">Annuler</Text>
            </TouchableOpacity>
            <Text className="text-white text-base font-semibold">Nouveau mandat</Text>
            <TouchableOpacity onPress={() => createMandate.mutate()} disabled={createMandate.isPending}>
              {createMandate.isPending ? (
                <ActivityIndicator color="#22c55e" size="small" />
              ) : (
                <Text className="text-pitch-400 text-sm font-semibold">Créer</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 pt-4">
            <Text className="text-stadium-400 text-xs mb-2">Sélectionner un joueur</Text>
            <View className="mb-4">
              {players?.slice(0, 20).map((player) => (
                <TouchableOpacity
                  key={player.id}
                  className={`flex-row items-center px-4 py-3 rounded-xl mb-1.5 border ${
                    selectedPlayerId === player.id
                      ? "bg-pitch-600/10 border-pitch-600/30"
                      : "bg-stadium-800 border-stadium-700"
                  }`}
                  onPress={() => setSelectedPlayerId(player.id)}
                >
                  <View className="w-8 h-8 bg-stadium-700 rounded-full items-center justify-center mr-2">
                    <Text className="text-white text-xs font-bold">
                      {player.user?.name?.charAt(0)?.toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-white text-sm flex-1">{player.user?.name}</Text>
                  {selectedPlayerId === player.id && (
                    <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <ModalInput label="Date début (AAAA-MM-JJ)" value={mandateStartDate} onChangeText={setMandateStartDate} />
            <ModalInput label="Date fin (AAAA-MM-JJ)" value={mandateEndDate} onChangeText={setMandateEndDate} />

            <Text className="text-stadium-400 text-xs mb-1.5">Conditions</Text>
            <TextInput
              className="text-white text-sm bg-stadium-800 rounded-xl px-4 py-3 border border-stadium-700 mb-8 min-h-[80px]"
              value={mandateTerms}
              onChangeText={setMandateTerms}
              placeholder="Conditions du mandat..."
              placeholderTextColor="#52525b"
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  )
}

function ModalInput({
  label,
  value,
  onChangeText,
}: {
  label: string
  value: string
  onChangeText: (text: string) => void
}) {
  return (
    <View className="mb-3">
      <Text className="text-stadium-400 text-xs mb-1.5">{label}</Text>
      <TextInput
        className="text-white text-sm bg-stadium-800 rounded-xl px-4 py-3 border border-stadium-700"
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#52525b"
      />
    </View>
  )
}
