import { Stack } from "expo-router"

export default function AgentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#18181b" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600", fontSize: 16 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#09090b" },
      }}
    >
      <Stack.Screen name="submissions" options={{ title: "Soumissions" }} />
      <Stack.Screen name="mandates" options={{ title: "Mandats" }} />
      <Stack.Screen name="credits" options={{ title: "Crédits" }} />
      <Stack.Screen name="edit-profile" options={{ title: "Modifier le profil" }} />
      <Stack.Screen name="players" options={{ title: "Mes joueurs" }} />
      <Stack.Screen name="reports" options={{ title: "Mes rapports" }} />
    </Stack>
  )
}
