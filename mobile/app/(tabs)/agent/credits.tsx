import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import { useState, useCallback } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface Wallet {
  id: string
  type: string
  balance: number
}

export default function AgentCreditsScreen() {
  const [refreshing, setRefreshing] = useState(false)

  const { data: wallets, refetch } = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const result = await api.get<Wallet[]>("/credits/wallets")
      return Array.isArray(result.data) ? result.data : []
    },
  })

  const totalBalance = wallets?.reduce((sum, w) => sum + w.balance, 0) ?? 0

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  return (
    <ScrollView
      className="flex-1 bg-stadium-950"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
      }
    >
      {/* Balance Card */}
      <View className="mx-4 mt-4 rounded-2xl p-6 bg-pitch-600">
        <Text className="text-pitch-100 text-sm">Solde total</Text>
        <Text className="text-white text-4xl font-bold mt-1">
          {totalBalance}
        </Text>
        <Text className="text-pitch-200 text-sm mt-1">crédits</Text>

        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity
            className="flex-1 bg-white/20 rounded-xl py-3 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white text-sm font-semibold">Acheter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-white/10 rounded-xl py-3 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white/80 text-sm font-semibold">Retrait</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wallets */}
      <View className="mx-4 mt-6 mb-8">
        <Text className="text-white text-base font-semibold mb-3">
          Mes portefeuilles
        </Text>
        {wallets?.map((wallet) => (
          <View
            key={wallet.id}
            className="bg-stadium-900 border border-stadium-800 rounded-xl px-4 py-3 mb-2 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="wallet-outline" size={18} color="#71717a" />
              <Text className="text-stadium-200 text-sm ml-2 capitalize">
                {wallet.type.toLowerCase()}
              </Text>
            </View>
            <Text className="text-white text-base font-semibold">{wallet.balance}</Text>
          </View>
        ))}

        {(!wallets || wallets.length === 0) && (
          <View className="bg-stadium-900 border border-stadium-800 rounded-xl p-6 items-center">
            <Ionicons name="wallet-outline" size={32} color="#3f3f46" />
            <Text className="text-stadium-500 text-sm mt-3">
              Aucun portefeuille
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
