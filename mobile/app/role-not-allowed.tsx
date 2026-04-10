import { View, Text, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { useAuthStore } from "@/stores/auth-store"

export default function RoleNotAllowedScreen() {
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.replace("/(auth)/login")
  }

  return (
    <SafeAreaView className="flex-1 bg-stadium-950 px-6 justify-center">
      <Text className="text-white text-xl font-bold text-center">
        Application réservée aux joueurs
      </Text>
      <Text className="text-stadium-400 text-sm text-center mt-4 leading-5">
        Les comptes agents et clubs utilisent Profoot Profile sur le web. Déconnectez-vous pour vous
        connecter avec un compte joueur.
      </Text>
      <TouchableOpacity
        className="bg-pitch-500 rounded-xl py-4 items-center mt-10"
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Text className="text-white text-base font-semibold">Retour à la connexion</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
