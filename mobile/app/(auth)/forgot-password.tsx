import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native"
import { router } from "expo-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { forgotPasswordSchema, type ForgotPasswordInput } from "@pfp/shared-validators"
import { forgotPassword } from "@/lib/auth"

export default function ForgotPasswordScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true)
    try {
      await forgotPassword(data.email)
      Alert.alert(
        "Email envoyé",
        "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
        [{ text: "OK", onPress: () => router.back() }]
      )
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
      <View className="flex-1 justify-center px-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-8">
          <Text className="text-pitch-400 text-base">← Retour</Text>
        </TouchableOpacity>

        <Text className="text-white text-2xl font-bold mb-2">
          Mot de passe oublié
        </Text>
        <Text className="text-stadium-400 text-sm mb-8">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </Text>

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

        <TouchableOpacity
          className={`bg-pitch-500 rounded-xl py-4 items-center mt-6 ${
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
              Envoyer le lien
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
