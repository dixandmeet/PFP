import { View, Text, ScrollView, FlatList, TouchableOpacity, Modal, Alert, RefreshControl, ActivityIndicator } from "react-native"
import { useState, useCallback } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface Agent {
  id: string
  firstName?: string
  lastName?: string
  agencyName?: string
  licenseNumber?: string
  licenseCountry?: string
  bio?: string
  specialties?: string[]
  phoneNumber?: string
  website?: string
  isVerified?: boolean
  activeMandatesCount?: number
  user: { name: string; email?: string }
}

interface Mandate {
  id: string
  status: string
  startDate?: string
  endDate?: string
  terms?: string
  agent: { id: string; user: { name: string }; agencyName?: string }
  createdAt: string
}

type TabType = "agents" | "mandates"

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

export default function PlayerAgentsScreen() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>("mandates")
  const [refreshing, setRefreshing] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const { data: mandates, refetch: refetchMandates, isLoading: loadingMandates } = useQuery({
    queryKey: ["mandates"],
    queryFn: async () => {
      const result = await api.get<Mandate[]>("/mandates")
      return Array.isArray(result.data) ? result.data : []
    },
  })

  const { data: agents, refetch: refetchAgents, isLoading: loadingAgents } = useQuery({
    queryKey: ["agents-list"],
    queryFn: async () => {
      const result = await api.get<Agent[]>("/agents")
      return Array.isArray(result.data) ? result.data : []
    },
    enabled: activeTab === "agents",
  })

  const updateMandateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const result = await api.patch(`/mandates/${id}/status`, { status })
      if (!result.success) throw new Error(result.error || "Erreur")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mandates"] })
    },
    onError: (error: Error) => {
      Alert.alert("Erreur", error.message)
    },
  })

  const handleMandateAction = (mandate: Mandate, action: string) => {
    const messages: Record<string, string> = {
      ACTIVE: "Accepter ce mandat ?",
      REJECTED: "Refuser ce mandat ?",
      TERMINATED: "Résilier ce mandat ?",
    }
    Alert.alert("Confirmation", messages[action] || "Confirmer ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Confirmer",
        style: action === "ACTIVE" ? "default" : "destructive",
        onPress: () => updateMandateStatus.mutate({ id: mandate.id, status: action }),
      },
    ])
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    if (activeTab === "mandates") await refetchMandates()
    else await refetchAgents()
    setRefreshing(false)
  }, [activeTab, refetchMandates, refetchAgents])

  const activeMandate = mandates?.find((m) => m.status === "ACTIVE")

  return (
    <ScrollView
      className="flex-1 bg-stadium-950"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
      }
    >
      {/* Active Mandate Banner */}
      {activeMandate && (
        <View className="mx-4 mt-4 bg-pitch-600/10 border border-pitch-600/30 rounded-2xl p-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            <Text className="text-pitch-400 text-xs font-semibold ml-1">Mandat actif</Text>
          </View>
          <Text className="text-white text-sm font-semibold">
            {activeMandate.agent?.user?.name}
          </Text>
          {activeMandate.agent?.agencyName && (
            <Text className="text-stadium-400 text-xs mt-0.5">
              {activeMandate.agent.agencyName}
            </Text>
          )}
          {activeMandate.endDate && (
            <Text className="text-stadium-500 text-xs mt-1">
              Expire le {new Date(activeMandate.endDate).toLocaleDateString("fr-FR")}
            </Text>
          )}
        </View>
      )}

      {/* Tabs */}
      <View className="flex-row mx-4 mt-4 gap-2">
        {[
          { key: "mandates" as TabType, label: "Mes mandats" },
          { key: "agents" as TabType, label: "Agents disponibles" },
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

      {/* Content */}
      <View className="px-4 mt-4 mb-8">
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
                <Text className="text-stadium-500 text-sm mt-3 text-center">
                  Aucun mandat pour le moment
                </Text>
              </View>
            )}
            {mandates?.map((mandate) => {
              const statusStyle = STATUS_COLORS[mandate.status] || STATUS_COLORS.PENDING
              return (
                <View key={mandate.id} className="bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-3">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-white text-sm font-semibold">
                        {mandate.agent?.user?.name}
                      </Text>
                      {mandate.agent?.agencyName && (
                        <Text className="text-stadium-400 text-xs mt-0.5">{mandate.agent.agencyName}</Text>
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

                  {mandate.status === "PENDING" && (
                    <View className="flex-row gap-2 mt-3 pt-3 border-t border-stadium-800">
                      <TouchableOpacity
                        className="flex-1 bg-pitch-600 rounded-xl py-2.5 items-center"
                        onPress={() => handleMandateAction(mandate, "ACTIVE")}
                        activeOpacity={0.7}
                      >
                        <Text className="text-white text-xs font-semibold">Accepter</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 items-center"
                        onPress={() => handleMandateAction(mandate, "REJECTED")}
                        activeOpacity={0.7}
                      >
                        <Text className="text-red-400 text-xs font-semibold">Refuser</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {mandate.status === "ACTIVE" && (
                    <View className="mt-3 pt-3 border-t border-stadium-800">
                      <TouchableOpacity
                        className="bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 items-center"
                        onPress={() => handleMandateAction(mandate, "TERMINATED")}
                        activeOpacity={0.7}
                      >
                        <Text className="text-red-400 text-xs font-semibold">Résilier le mandat</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )
            })}
          </>
        )}

        {activeTab === "agents" && (
          <>
            {loadingAgents && (
              <View className="items-center py-12">
                <ActivityIndicator color="#22c55e" />
              </View>
            )}
            {!loadingAgents && (!agents || agents.length === 0) && (
              <View className="bg-stadium-900 border border-stadium-800 rounded-2xl p-6 items-center">
                <Ionicons name="people-outline" size={40} color="#3f3f46" />
                <Text className="text-stadium-500 text-sm mt-3">Aucun agent disponible</Text>
              </View>
            )}
            {agents?.map((agent) => (
              <TouchableOpacity
                key={agent.id}
                className="bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-3"
                onPress={() => setSelectedAgent(agent)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-stadium-700 rounded-full items-center justify-center mr-3">
                    <Text className="text-white text-base font-bold">
                      {agent.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-white text-sm font-semibold">{agent.user?.name}</Text>
                      {agent.isVerified && (
                        <Ionicons name="checkmark-circle" size={14} color="#22c55e" style={{ marginLeft: 4 }} />
                      )}
                    </View>
                    {agent.agencyName && (
                      <Text className="text-stadium-400 text-xs mt-0.5">{agent.agencyName}</Text>
                    )}
                    {agent.licenseCountry && (
                      <Text className="text-stadium-500 text-xs mt-0.5">{agent.licenseCountry}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#52525b" />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>

      {/* Agent Detail Modal */}
      <Modal visible={!!selectedAgent} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-stadium-950">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-stadium-800">
            <TouchableOpacity onPress={() => setSelectedAgent(null)}>
              <Text className="text-stadium-400 text-sm">Fermer</Text>
            </TouchableOpacity>
            <Text className="text-white text-base font-semibold">Détails agent</Text>
            <View style={{ width: 50 }} />
          </View>

          {selectedAgent && (
            <ScrollView className="flex-1 px-4 pt-6">
              <View className="items-center mb-6">
                <View className="w-20 h-20 bg-stadium-700 rounded-full items-center justify-center mb-3">
                  <Text className="text-white text-2xl font-bold">
                    {selectedAgent.user?.name?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-white text-lg font-bold">{selectedAgent.user?.name}</Text>
                  {selectedAgent.isVerified && (
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" style={{ marginLeft: 4 }} />
                  )}
                </View>
                {selectedAgent.agencyName && (
                  <Text className="text-stadium-400 text-sm mt-1">{selectedAgent.agencyName}</Text>
                )}
              </View>

              {selectedAgent.bio && (
                <View className="bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-4">
                  <Text className="text-stadium-500 text-xs font-semibold uppercase mb-2">Bio</Text>
                  <Text className="text-stadium-200 text-sm leading-5">{selectedAgent.bio}</Text>
                </View>
              )}

              <View className="bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-4">
                <Text className="text-stadium-500 text-xs font-semibold uppercase mb-3">Informations</Text>
                {selectedAgent.licenseNumber && (
                  <InfoRow icon="card-outline" label="Licence" value={selectedAgent.licenseNumber} />
                )}
                {selectedAgent.licenseCountry && (
                  <InfoRow icon="flag-outline" label="Pays" value={selectedAgent.licenseCountry} />
                )}
                {selectedAgent.phoneNumber && (
                  <InfoRow icon="call-outline" label="Téléphone" value={selectedAgent.phoneNumber} />
                )}
                {selectedAgent.website && (
                  <InfoRow icon="globe-outline" label="Site web" value={selectedAgent.website} />
                )}
              </View>

              {selectedAgent.specialties && selectedAgent.specialties.length > 0 && (
                <View className="bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-8">
                  <Text className="text-stadium-500 text-xs font-semibold uppercase mb-3">Spécialités</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {selectedAgent.specialties.map((s, i) => (
                      <View key={i} className="bg-pitch-500/15 px-3 py-1.5 rounded-full">
                        <Text className="text-pitch-400 text-xs">{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </ScrollView>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; value: string }) {
  return (
    <View className="flex-row items-center mb-2.5">
      <Ionicons name={icon} size={16} color="#71717a" />
      <Text className="text-stadium-400 text-xs ml-2 w-20">{label}</Text>
      <Text className="text-white text-sm flex-1">{value}</Text>
    </View>
  )
}
