import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native"
import { useState } from "react"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"

export default function SettingsScreen() {
  const { user, logout } = useAuthStore()
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)

  const updateEmail = useMutation({
    mutationFn: async () => {
      const result = await api.patch("/users/me", { email })
      if (!result.success) throw new Error(result.error || "Erreur")
      return result
    },
    onSuccess: () => {
      Alert.alert("Succès", "Votre email a été mis à jour.")
    },
    onError: (error: Error) => {
      Alert.alert("Erreur", error.message)
    },
  })

  const updatePassword = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas.")
      }
      if (newPassword.length < 8) {
        throw new Error("Le mot de passe doit contenir au moins 8 caractères.")
      }
      const result = await api.patch("/users/me/password", {
        currentPassword,
        newPassword,
      })
      if (!result.success) throw new Error(result.error || "Erreur")
      return result
    },
    onSuccess: () => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      Alert.alert("Succès", "Votre mot de passe a été modifié.")
    },
    onError: (error: Error) => {
      Alert.alert("Erreur", error.message)
    },
  })

  const deleteAccount = useMutation({
    mutationFn: async () => {
      const result = await api.delete("/users/me")
      if (!result.success) throw new Error(result.error || "Erreur")
      return result
    },
    onSuccess: async () => {
      await logout()
      router.replace("/(auth)/login")
    },
    onError: (error: Error) => {
      Alert.alert("Erreur", error.message)
    },
  })

  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer le compte",
      "Cette action est irréversible. Toutes vos données seront supprimées définitivement.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteAccount.mutate(),
        },
      ]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-stadium-950">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-stadium-800">
          <Text className="text-white text-lg font-bold">Paramètres</Text>
        </View>

        {/* Email Section */}
        <View className="px-4 mt-6">
          <Text className="text-stadium-500 text-xs font-semibold uppercase tracking-wider px-2 mb-3">
            Adresse email
          </Text>
          <View className="bg-stadium-900 border border-stadium-800 rounded-2xl p-4">
            <TextInput
              className="text-white text-sm bg-stadium-800 rounded-xl px-4 py-3 border border-stadium-700"
              value={email}
              onChangeText={setEmail}
              placeholder="Votre email"
              placeholderTextColor="#52525b"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              className="bg-pitch-600 rounded-xl py-3 items-center mt-3"
              onPress={() => updateEmail.mutate()}
              disabled={updateEmail.isPending || email === user?.email}
              activeOpacity={0.7}
            >
              {updateEmail.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-sm font-semibold">
                  Mettre à jour l'email
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Password Section */}
        <View className="px-4 mt-6">
          <Text className="text-stadium-500 text-xs font-semibold uppercase tracking-wider px-2 mb-3">
            Mot de passe
          </Text>
          <View className="bg-stadium-900 border border-stadium-800 rounded-2xl p-4">
            <TextInput
              className="text-white text-sm bg-stadium-800 rounded-xl px-4 py-3 border border-stadium-700 mb-3"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Mot de passe actuel"
              placeholderTextColor="#52525b"
              secureTextEntry={!showPasswords}
            />
            <TextInput
              className="text-white text-sm bg-stadium-800 rounded-xl px-4 py-3 border border-stadium-700 mb-3"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nouveau mot de passe"
              placeholderTextColor="#52525b"
              secureTextEntry={!showPasswords}
            />
            <TextInput
              className="text-white text-sm bg-stadium-800 rounded-xl px-4 py-3 border border-stadium-700 mb-3"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmer le nouveau mot de passe"
              placeholderTextColor="#52525b"
              secureTextEntry={!showPasswords}
            />
            <TouchableOpacity
              className="flex-row items-center mb-3"
              onPress={() => setShowPasswords(!showPasswords)}
            >
              <Ionicons
                name={showPasswords ? "eye-off-outline" : "eye-outline"}
                size={16}
                color="#71717a"
              />
              <Text className="text-stadium-400 text-xs ml-2">
                {showPasswords ? "Masquer" : "Afficher"} les mots de passe
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-pitch-600 rounded-xl py-3 items-center"
              onPress={() => updatePassword.mutate()}
              disabled={updatePassword.isPending || !currentPassword || !newPassword}
              activeOpacity={0.7}
            >
              {updatePassword.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-sm font-semibold">
                  Changer le mot de passe
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="px-4 mt-8 mb-12">
          <Text className="text-red-400 text-xs font-semibold uppercase tracking-wider px-2 mb-3">
            Zone de danger
          </Text>
          <View className="bg-stadium-900 border border-red-500/20 rounded-2xl p-4">
            <Text className="text-stadium-300 text-sm mb-4">
              La suppression de votre compte est définitive et entraînera la perte de toutes vos données.
            </Text>
            <TouchableOpacity
              className="bg-red-500/10 border border-red-500/20 rounded-xl py-3 items-center"
              onPress={handleDeleteAccount}
              disabled={deleteAccount.isPending}
              activeOpacity={0.7}
            >
              {deleteAccount.isPending ? (
                <ActivityIndicator color="#ef4444" size="small" />
              ) : (
                <Text className="text-red-400 text-sm font-semibold">
                  Supprimer mon compte
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
