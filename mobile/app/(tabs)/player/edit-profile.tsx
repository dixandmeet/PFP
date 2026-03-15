import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import * as ImagePicker from "expo-image-picker"

const POSITIONS = [
  "Gardien", "Défenseur central", "Latéral droit", "Latéral gauche",
  "Milieu défensif", "Milieu central", "Milieu offensif",
  "Ailier droit", "Ailier gauche", "Avant-centre", "Second attaquant",
]

const STRONG_FOOT_OPTIONS = ["Droit", "Gauche", "Les deux"]

export default function EditPlayerProfileScreen() {
  const queryClient = useQueryClient()

  const { data: userData } = useQuery({
    queryKey: ["user-me"],
    queryFn: async () => {
      const result = await api.get<any>("/users/me")
      return result.data
    },
  })

  const profile = userData?.playerProfile || userData?.profile
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [nationality, setNationality] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [strongFoot, setStrongFoot] = useState("")
  const [currentClub, setCurrentClub] = useState("")
  const [league, setLeague] = useState("")
  const [position, setPosition] = useState("")
  const [secondaryPosition, setSecondaryPosition] = useState("")
  const [bio, setBio] = useState("")

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || userData?.name?.split(" ")[0] || "")
      setLastName(profile.lastName || userData?.name?.split(" ").slice(1).join(" ") || "")
      setDisplayName(profile.displayName || "")
      setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "")
      setNationality(profile.nationality || "")
      setHeight(profile.height?.toString() || "")
      setWeight(profile.weight?.toString() || "")
      setStrongFoot(profile.strongFoot || "")
      setCurrentClub(profile.currentClub || "")
      setLeague(profile.league || "")
      setPosition(profile.position || "")
      setSecondaryPosition(profile.secondaryPosition || "")
      setBio(profile.bio || "")
    }
  }, [profile, userData])

  const updateProfile = useMutation({
    mutationFn: async () => {
      const playerId = profile?.id
      if (!playerId) throw new Error("Profil joueur introuvable")
      const body: Record<string, any> = {
        firstName,
        lastName,
        displayName: displayName || undefined,
        dateOfBirth: dateOfBirth || undefined,
        nationality: nationality || undefined,
        height: height ? parseInt(height) : undefined,
        weight: weight ? parseInt(weight) : undefined,
        strongFoot: strongFoot || undefined,
        currentClub: currentClub || undefined,
        league: league || undefined,
        position: position || undefined,
        secondaryPosition: secondaryPosition || undefined,
        bio: bio || undefined,
      }
      const result = await api.patch(`/players/${playerId}`, body)
      if (!result.success) throw new Error(result.error || "Erreur")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-me"] })
      Alert.alert("Succès", "Profil mis à jour avec succès.")
      router.back()
    },
    onError: (error: Error) => {
      Alert.alert("Erreur", error.message)
    },
  })

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const formData = new FormData()
      formData.append("file", {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any)
      try {
        await api.post("/files/upload-proxy", formData)
        queryClient.invalidateQueries({ queryKey: ["user-me"] })
        Alert.alert("Succès", "Photo mise à jour.")
      } catch {
        Alert.alert("Erreur", "Impossible de télécharger la photo.")
      }
    }
  }

  return (
    <ScrollView className="flex-1 bg-stadium-950">
      {/* Photo */}
      <View className="items-center pt-6 pb-4">
        <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
          <View className="w-24 h-24 bg-stadium-700 rounded-full items-center justify-center">
            <Ionicons name="camera" size={28} color="#a1a1aa" />
          </View>
          <View className="absolute bottom-0 right-0 bg-pitch-600 w-8 h-8 rounded-full items-center justify-center">
            <Ionicons name="pencil" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text className="text-stadium-400 text-xs mt-2">Modifier la photo</Text>
      </View>

      {/* Personal Info */}
      <SectionTitle title="Informations personnelles" />
      <View className="mx-4 bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-4">
        <InputField label="Prénom" value={firstName} onChangeText={setFirstName} />
        <InputField label="Nom" value={lastName} onChangeText={setLastName} />
        <InputField label="Nom d'affichage" value={displayName} onChangeText={setDisplayName} />
        <InputField
          label="Date de naissance (AAAA-MM-JJ)"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="1998-05-15"
        />
        <InputField label="Nationalité" value={nationality} onChangeText={setNationality} last />
      </View>

      {/* Physical */}
      <SectionTitle title="Caractéristiques physiques" />
      <View className="mx-4 bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-4">
        <InputField label="Taille (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
        <InputField label="Poids (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
        <View className="mb-1">
          <Text className="text-stadium-400 text-xs mb-2">Pied fort</Text>
          <View className="flex-row gap-2">
            {STRONG_FOOT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  strongFoot === opt
                    ? "bg-pitch-600 border-pitch-500"
                    : "bg-stadium-800 border-stadium-700"
                }`}
                onPress={() => setStrongFoot(opt)}
              >
                <Text className={`text-xs font-medium ${strongFoot === opt ? "text-white" : "text-stadium-400"}`}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Football Info */}
      <SectionTitle title="Informations footballistiques" />
      <View className="mx-4 bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-4">
        <InputField label="Club actuel" value={currentClub} onChangeText={setCurrentClub} />
        <InputField label="Ligue" value={league} onChangeText={setLeague} />
        <View className="mb-3">
          <Text className="text-stadium-400 text-xs mb-2">Position principale</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {POSITIONS.map((pos) => (
                <TouchableOpacity
                  key={pos}
                  className={`px-3 py-2 rounded-lg border ${
                    position === pos
                      ? "bg-pitch-600 border-pitch-500"
                      : "bg-stadium-800 border-stadium-700"
                  }`}
                  onPress={() => setPosition(pos)}
                >
                  <Text className={`text-xs ${position === pos ? "text-white" : "text-stadium-400"}`}>
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        <View className="mb-1">
          <Text className="text-stadium-400 text-xs mb-2">Position secondaire</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {POSITIONS.filter((p) => p !== position).map((pos) => (
                <TouchableOpacity
                  key={pos}
                  className={`px-3 py-2 rounded-lg border ${
                    secondaryPosition === pos
                      ? "bg-pitch-600 border-pitch-500"
                      : "bg-stadium-800 border-stadium-700"
                  }`}
                  onPress={() => setSecondaryPosition(secondaryPosition === pos ? "" : pos)}
                >
                  <Text className={`text-xs ${secondaryPosition === pos ? "text-white" : "text-stadium-400"}`}>
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Bio */}
      <SectionTitle title="Biographie" />
      <View className="mx-4 bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-4">
        <TextInput
          className="text-white text-sm bg-stadium-800 rounded-xl px-4 py-3 border border-stadium-700 min-h-[100px]"
          value={bio}
          onChangeText={setBio}
          placeholder="Décrivez votre parcours..."
          placeholderTextColor="#52525b"
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Save Button */}
      <View className="mx-4 mb-12">
        <TouchableOpacity
          className="bg-pitch-600 rounded-2xl py-4 items-center"
          onPress={() => updateProfile.mutate()}
          disabled={updateProfile.isPending}
          activeOpacity={0.7}
        >
          {updateProfile.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white text-base font-semibold">
              Enregistrer les modifications
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-stadium-500 text-xs font-semibold uppercase tracking-wider px-6 mb-3 mt-2">
      {title}
    </Text>
  )
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  last,
}: {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  keyboardType?: "default" | "numeric" | "email-address"
  last?: boolean
}) {
  return (
    <View className={last ? "" : "mb-3"}>
      <Text className="text-stadium-400 text-xs mb-1.5">{label}</Text>
      <TextInput
        className="text-white text-sm bg-stadium-800 rounded-xl px-4 py-3 border border-stadium-700"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#52525b"
        keyboardType={keyboardType || "default"}
      />
    </View>
  )
}
