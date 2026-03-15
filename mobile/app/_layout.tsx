import { useEffect } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { QueryClientProvider } from "@tanstack/react-query"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import * as SplashScreen from "expo-splash-screen"

import { queryClient } from "@/lib/query-client"
import { useAuthStore } from "@/stores/auth-store"
import "../src/styles/global.css"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { initialize, isLoading } = useAuthStore()

  useEffect(() => {
    initialize().finally(() => {
      SplashScreen.hideAsync()
    })
  }, [initialize])

  if (isLoading) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#09090b" },
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
