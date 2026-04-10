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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", name: "", role: "PLAYER" },
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true)
    try {
      const result = await registerUser({ ...data, role: "PLAYER" })
      if (result.success) {
        Alert.alert(
          "Presque terminé",
          "Un e-mail de confirmation vous a été envoyé. Ouvrez le lien pour activer votre compte, puis connectez-vous. Sans cette étape, la connexion sera refusée.",
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
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-pitch-500 rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">PFP</Text>
            </View>
            <Text className="text-white text-2xl font-bold">
              Créer un compte joueur
            </Text>
            <Text className="text-stadium-400 text-sm mt-2 text-center">
              L’app mobile est réservée aux joueurs. Les agents s’inscrivent sur profootprofile.com.
            </Text>
          </View>

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
