import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Link, router } from "expo-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { registerSchema, type RegisterInput } from "@pfp/shared-validators"
import { register as registerUser } from "@/lib/auth"

export default function RegisterScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"PLAYER" | "AGENT">("PLAYER")

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", name: "", role: "PLAYER" },
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true)
    try {
      const result = await registerUser(data)
      if (result.success) {
        Alert.alert(
          "Inscription réussie",
          "Vérifiez votre email pour confirmer votre compte.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
        )
      } else {
        Alert.alert("Erreur", result.error || "Échec de l'inscription")
      }
    } catch {
      Alert.alert("Erreur", "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRoleSelect = (role: "PLAYER" | "AGENT") => {
    setSelectedRole(role)
    setValue("role", role)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-stadium-950"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-8 py-12">
          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-pitch-500 rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">PFP</Text>
            </View>
            <Text className="text-white text-2xl font-bold">
              Créer un compte
            </Text>
            <Text className="text-stadium-400 text-sm mt-2">
              Rejoignez la communauté Profoot Profile
            </Text>
          </View>

          {/* Role Selection */}
          <View className="mb-6">
            <Text className="text-stadium-300 text-sm mb-3 font-medium">
              Je suis...
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-4 rounded-xl border-2 items-center ${
                  selectedRole === "PLAYER"
                    ? "border-pitch-500 bg-pitch-500/10"
                    : "border-stadium-700 bg-stadium-900"
                }`}
                onPress={() => handleRoleSelect("PLAYER")}
                activeOpacity={0.8}
              >
                <Text className="text-2xl mb-1">⚽</Text>
                <Text
                  className={`font-semibold ${
                    selectedRole === "PLAYER" ? "text-pitch-400" : "text-stadium-300"
                  }`}
                >
                  Joueur
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-4 rounded-xl border-2 items-center ${
                  selectedRole === "AGENT"
                    ? "border-pitch-500 bg-pitch-500/10"
                    : "border-stadium-700 bg-stadium-900"
                }`}
                onPress={() => handleRoleSelect("AGENT")}
                activeOpacity={0.8}
              >
                <Text className="text-2xl mb-1">🤝</Text>
                <Text
                  className={`font-semibold ${
                    selectedRole === "AGENT" ? "text-pitch-400" : "text-stadium-300"
                  }`}
                >
                  Agent
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View className="gap-4">
            <View>
              <Text className="text-stadium-300 text-sm mb-2 font-medium">
                Nom complet
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-stadium-900 border border-stadium-700 rounded-xl px-4 py-3.5 text-white text-base"
                    placeholder="Jean Dupont"
                    placeholderTextColor="#71717a"
                    autoCapitalize="words"
                    autoComplete="name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-400 text-xs mt-1">
                  {errors.name.message}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-stadium-300 text-sm mb-2 font-medium">
                Email
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-stadium-900 border border-stadium-700 rounded-xl px-4 py-3.5 text-white text-base"
                    placeholder="votre@email.com"
                    placeholderTextColor="#71717a"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-stadium-300 text-sm mb-2 font-medium">
                Mot de passe
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-stadium-900 border border-stadium-700 rounded-xl px-4 py-3.5 text-white text-base"
                    placeholder="••••••••"
                    placeholderTextColor="#71717a"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.password && (
                <Text className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              className={`bg-pitch-500 rounded-xl py-4 items-center mt-4 ${
                isSubmitting ? "opacity-70" : ""
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Créer mon compte
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-stadium-400 text-sm">
              Déjà un compte ?{" "}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-pitch-400 text-sm font-semibold">
                  Se connecter
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
