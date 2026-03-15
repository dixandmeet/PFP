import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, RefreshControl, ActivityIndicator } from "react-native"
import { useState, useCallback } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"

interface CareerEntry {
  id: string
  clubName: string
  league?: string
  country?: string
  season?: string
  startDate?: string
  endDate?: string
  position?: string
  appearances?: number
  minutesPlayed?: number
  goals?: number
  assists?: number
}

const POSITIONS = [
  "Gardien", "Défenseur central", "Latéral droit", "Latéral gauche",
  "Milieu défensif", "Milieu central", "Milieu offensif",
  "Ailier droit", "Ailier gauche", "Avant-centre", "Second attaquant",
]

export default function CareerScreen() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form state
  const [clubName, setClubName] = useState("")
  const [league, setLeague] = useState("")
  const [country, setCountry] = useState("")
  const [season, setSeason] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [position, setPosition] = useState("")
  const [appearances, setAppearances] = useState("")
  const [goals, setGoals] = useState("")
  const [assists, setAssists] = useState("")

  const { data: userData } = useQuery({
    queryKey: ["user-me"],
    queryFn: async () => {
      const result = await api.get<any>("/users/me")
      return result.data
    },
  })

  const playerId = userData?.playerProfile?.id || userData?.profile?.id

  const { data: career, refetch, isLoading } = useQuery({
    queryKey: ["career", playerId],
    queryFn: async () => {
      if (!playerId) return []
      const result = await api.get<CareerEntry[]>(`/players/${playerId}/career`)
      return Array.isArray(result.data) ? result.data : []
    },
    enabled: !!playerId,
  })

  const addEntry = useMutation({
    mutationFn: async () => {
      if (!clubName.trim()) throw new Error("Le nom du club est requis.")
      if (!playerId) throw new Error("Profil introuvable.")
      const body: Record<string, any> = {
        clubName: clubName.trim(),
        league: league || undefined,
        country: country || undefined,
        season: season || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        position: position || undefined,
        appearances: appearances ? parseInt(appearances) : undefined,
        goals: goals ? parseInt(goals) : undefined,
        assists: assists ? parseInt(assists) : undefined,
      }
      const result = await api.post(`/players/${playerId}/career`, body)
      if (!result.success) throw new Error(result.error || "Erreur")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career"] })
      resetForm()
      setShowAddModal(false)
      Alert.alert("Succès", "Expérience ajoutée.")
    },
    onError: (error: Error) => {
      Alert.alert("Erreur", error.message)
    },
  })

  const deleteEntry = useMutation({
    mutationFn: async (entryId: string) => {
      const result = await api.delete(`/players/${playerId}/career?entryId=${entryId}`)
      if (!result.success) throw new Error(result.error || "Erreur")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career"] })
    },
  })

  const handleDelete = (entry: CareerEntry) => {
    Alert.alert("Supprimer", `Supprimer l'expérience à ${entry.clubName} ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => deleteEntry.mutate(entry.id) },
    ])
  }

  const resetForm = () => {
    setClubName("")
    setLeague("")
    setCountry("")
    setSeason("")
    setStartDate("")
    setEndDate("")
    setPosition("")
    setAppearances("")
    setGoals("")
    setAssists("")
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const totalAppearances = career?.reduce((sum, e) => sum + (e.appearances || 0), 0) ?? 0
  const totalGoals = career?.reduce((sum, e) => sum + (e.goals || 0), 0) ?? 0
  const totalAssists = career?.reduce((sum, e) => sum + (e.assists || 0), 0) ?? 0
  const clubsCount = new Set(career?.map((e) => e.clubName)).size

  return (
    <ScrollView
      className="flex-1 bg-stadium-950"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
      }
    >
      {/* Stats Summary */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row gap-2">
          {[
            { label: "Clubs", value: clubsCount },
            { label: "Matchs", value: totalAppearances },
            { label: "Buts", value: totalGoals },
            { label: "Passes", value: totalAssists },
          ].map((stat) => (
            <View key={stat.label} className="flex-1 bg-stadium-900 border border-stadium-800 rounded-xl p-3 items-center">
              <Text className="text-white text-lg font-bold">{stat.value}</Text>
              <Text className="text-stadium-500 text-xs mt-0.5">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Add Button */}
      <View className="px-4 mt-4 mb-2">
        <TouchableOpacity
          className="bg-pitch-600 rounded-xl py-3 flex-row items-center justify-center"
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="text-white text-sm font-semibold ml-1">Ajouter une expérience</Text>
        </TouchableOpacity>
      </View>

      {/* Career List */}
      <View className="px-4 mt-2 mb-8">
        {isLoading && (
          <View className="items-center py-12">
            <ActivityIndicator color="#22c55e" />
          </View>
        )}

        {!isLoading && (!career || career.length === 0) && (
          <View className="bg-stadium-900 border border-stadium-800 rounded-2xl p-6 items-center">
            <Ionicons name="football-outline" size={40} color="#3f3f46" />
            <Text className="text-stadium-500 text-sm mt-3 text-center">
              Aucune expérience enregistrée.{"\n"}Ajoutez votre parcours !
            </Text>
          </View>
        )}

        {career?.map((entry) => (
          <View
            key={entry.id}
            className="bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-3"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-white text-sm font-semibold">{entry.clubName}</Text>
                <View className="flex-row items-center mt-1">
                  {entry.league && <Text className="text-stadium-400 text-xs">{entry.league}</Text>}
                  {entry.country && <Text className="text-stadium-500 text-xs ml-2">{entry.country}</Text>}
                </View>
                {entry.season && <Text className="text-stadium-500 text-xs mt-1">Saison {entry.season}</Text>}
                {entry.position && (
                  <View className="bg-pitch-500/15 px-2 py-0.5 rounded-full mt-2 self-start">
                    <Text className="text-pitch-400 text-xs">{entry.position}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => handleDelete(entry)} className="p-1">
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>

            {(entry.appearances || entry.goals || entry.assists) && (
              <View className="flex-row gap-4 mt-3 pt-3 border-t border-stadium-800">
                {entry.appearances != null && (
                  <View>
                    <Text className="text-white text-sm font-semibold">{entry.appearances}</Text>
                    <Text className="text-stadium-500 text-xs">Matchs</Text>
                  </View>
                )}
                {entry.goals != null && (
                  <View>
                    <Text className="text-white text-sm font-semibold">{entry.goals}</Text>
                    <Text className="text-stadium-500 text-xs">Buts</Text>
                  </View>
                )}
                {entry.assists != null && (
                  <View>
                    <Text className="text-white text-sm font-semibold">{entry.assists}</Text>
                    <Text className="text-stadium-500 text-xs">Passes D.</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Add Experience Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-stadium-950">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-stadium-800">
            <TouchableOpacity onPress={() => { resetForm(); setShowAddModal(false) }}>
              <Text className="text-stadium-400 text-sm">Annuler</Text>
            </TouchableOpacity>
            <Text className="text-white text-base font-semibold">Nouvelle expérience</Text>
            <TouchableOpacity onPress={() => addEntry.mutate()} disabled={addEntry.isPending}>
              {addEntry.isPending ? (
                <ActivityIndicator color="#22c55e" size="small" />
              ) : (
                <Text className="text-pitch-400 text-sm font-semibold">Ajouter</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 pt-4">
            <ModalInput label="Club *" value={clubName} onChangeText={setClubName} />
            <ModalInput label="Ligue" value={league} onChangeText={setLeague} />
            <ModalInput label="Pays" value={country} onChangeText={setCountry} />
            <ModalInput label="Saison (ex: 2023-2024)" value={season} onChangeText={setSeason} />
            <ModalInput label="Date début (AAAA-MM-JJ)" value={startDate} onChangeText={setStartDate} />
            <ModalInput label="Date fin (AAAA-MM-JJ)" value={endDate} onChangeText={setEndDate} />

            <Text className="text-stadium-400 text-xs mb-2 mt-1">Position</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {POSITIONS.map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    className={`px-3 py-2 rounded-lg border ${
                      position === pos ? "bg-pitch-600 border-pitch-500" : "bg-stadium-800 border-stadium-700"
                    }`}
                    onPress={() => setPosition(position === pos ? "" : pos)}
                  >
                    <Text className={`text-xs ${position === pos ? "text-white" : "text-stadium-400"}`}>{pos}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text className="text-stadium-500 text-xs font-semibold uppercase tracking-wider mb-3">
              Statistiques (optionnel)
            </Text>
            <View className="flex-row gap-3 mb-8">
              <View className="flex-1">
                <ModalInput label="Matchs" value={appearances} onChangeText={setAppearances} keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <ModalInput label="Buts" value={goals} onChangeText={setGoals} keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <ModalInput label="Passes D." value={assists} onChangeText={setAssists} keyboardType="numeric" />
              </View>
            </View>
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
  keyboardType,
}: {
  label: string
  value: string
  onChangeText: (text: string) => void
  keyboardType?: "default" | "numeric"
}) {
  return (
    <View className="mb-3">
      <Text className="text-stadium-400 text-xs mb-1.5">{label}</Text>
      <TextInput
        className="text-white text-sm bg-stadium-800 rounded-xl px-4 py-3 border border-stadium-700"
        value={value}
        onChangeText={onChangeText}
        placeholder={label.replace(" *", "")}
        placeholderTextColor="#52525b"
        keyboardType={keyboardType || "default"}
      />
    </View>
  )
}
