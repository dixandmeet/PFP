import { Stack } from "expo-router"

export default function PlayerLayout() {
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
      <Stack.Screen name="applications" options={{ title: "Candidatures" }} />
      <Stack.Screen name="credits" options={{ title: "Crédits" }} />
      <Stack.Screen name="edit-profile" options={{ title: "Modifier le profil" }} />
      <Stack.Screen name="career" options={{ title: "Mon parcours" }} />
      <Stack.Screen name="agents" options={{ title: "Mes agents" }} />
      <Stack.Screen name="reports" options={{ title: "Mes rapports" }} />
    </Stack>
  )
}
