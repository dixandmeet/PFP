import { useState, useEffect } from "react"
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
  StyleSheet,
} from "react-native"
import { Link, router } from "expo-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useAuthRequest,
  makeRedirectUri,
  ResponseType,
} from "expo-auth-session"
import * as WebBrowser from "expo-web-browser"
import { Ionicons } from "@expo/vector-icons"

import { loginSchema, type LoginInput } from "@pfp/shared-validators"
import { loginWithCredentials, loginWithGoogle } from "@/lib/auth"
import { useAuthStore } from "@/stores/auth-store"

WebBrowser.maybeCompleteAuthSession()

const googleDiscovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
}

export default function LoginScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const { setUser } = useAuthStore()

  const redirectUri = makeRedirectUri({ scheme: "pfp" })

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: Platform.select({
        ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
        default: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
      }),
      responseType: ResponseType.IdToken,
      scopes: ["openid", "profile", "email"],
      redirectUri,
    },
    googleDiscovery
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true)
    try {
      const result = await loginWithCredentials(data.email, data.password)
      if (result.success && result.user) {
        setUser(result.user)
        router.replace("/(tabs)")
      } else {
        Alert.alert("Erreur", result.error || "Échec de connexion")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue"
      Alert.alert("Erreur", message)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!response) return
    if (response.type === "success") {
      const idToken = response.params?.id_token
      if (idToken) {
        handleGoogleToken(idToken)
      } else {
        setIsGoogleLoading(false)
        Alert.alert("Erreur", "Token Google manquant dans la réponse.")
      }
    } else if (response.type === "cancel") {
      setIsGoogleLoading(false)
    } else {
      setIsGoogleLoading(false)
      Alert.alert("Erreur", "La connexion Google a échoué. Réessayez.")
    }
  }, [response])

  const handleGoogleToken = async (idToken: string) => {
    try {
      const authResult = await loginWithGoogle(idToken)
      if (authResult.success && authResult.user) {
        setUser(authResult.user)
        router.replace("/(tabs)")
      } else {
        Alert.alert("Erreur", authResult.error || "Échec de la connexion Google")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue"
      Alert.alert("Erreur", message)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await promptAsync()
    } catch (err) {
      setIsGoogleLoading(false)
      const message = err instanceof Error ? err.message : "Une erreur est survenue"
      Alert.alert("Erreur", message)
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
        <View className="flex-1 justify-center px-8">
          {/* Logo */}
          <View className="items-center mb-14">
            <View className="w-20 h-20 bg-pitch-500 rounded-3xl items-center justify-center mb-5"
              style={styles.logoShadow}
            >
              <Text className="text-white text-2xl font-bold">PFP</Text>
            </View>
            <Text className="text-white text-3xl font-bold tracking-tight">
              Profoot Profile
            </Text>
            <Text className="text-stadium-500 text-base mt-2">
              Connectez-vous à votre compte
            </Text>
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={!request || isGoogleLoading}
            activeOpacity={0.8}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="logo-google" size={18} color="#000" />
                <Text style={styles.googleButtonText}>Continuer avec Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-stadium-800" />
            <Text className="text-stadium-600 text-xs mx-4">OU</Text>
            <View className="flex-1 h-px bg-stadium-800" />
          </View>

          {/* Form */}
          <View className="gap-5">
            <View>
              <Text className="text-stadium-300 text-sm mb-2 font-medium ml-1">
                Email
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className="rounded-2xl overflow-hidden"
                    style={[
                      styles.inputContainer,
                      emailFocused && styles.inputContainerFocused,
                      errors.email && styles.inputContainerError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="votre@email.com"
                      placeholderTextColor="#52525b"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      onBlur={() => { onBlur(); setEmailFocused(false) }}
                      onFocus={() => setEmailFocused(true)}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text className="text-red-400 text-xs mt-1.5 ml-1">
                  {errors.email.message}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-stadium-300 text-sm mb-2 font-medium ml-1">
                Mot de passe
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className="rounded-2xl overflow-hidden"
                    style={[
                      styles.inputContainer,
                      passwordFocused && styles.inputContainerFocused,
                      errors.password && styles.inputContainerError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#52525b"
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="password"
                      onBlur={() => { onBlur(); setPasswordFocused(false) }}
                      onFocus={() => setPasswordFocused(true)}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
              {errors.password && (
                <Text className="text-red-400 text-xs mt-1.5 ml-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity className="self-end" activeOpacity={0.7}>
                <Text className="text-pitch-400 text-sm font-medium">
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity
              className="rounded-2xl items-center mt-2"
              style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-bold">
                  Se connecter
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <View className="flex-row justify-center mt-10">
            <Text className="text-stadium-500 text-sm">
              Pas encore de compte ?{" "}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-pitch-400 text-sm font-bold">
                  S'inscrire
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  logoShadow: {
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  googleButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  googleButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },
  inputContainer: {
    backgroundColor: "#18181b",
    borderWidth: 1.5,
    borderColor: "#27272a",
    borderRadius: 16,
  },
  inputContainerFocused: {
    borderColor: "#22c55e",
    backgroundColor: "#0c0c0d",
  },
  inputContainerError: {
    borderColor: "#f87171",
  },
  input: {
    color: "#ffffff",
    fontSize: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  submitButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
})
