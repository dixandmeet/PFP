import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import * as ImagePicker from "expo-image-picker"

export default function EditAgentProfileScreen() {
  const queryClient = useQueryClient()

  const { data: userData } = useQuery({
    queryKey: ["user-me"],
    queryFn: async () => {
      const result = await api.get<any>("/users/me")
      return result.data
    },
  })

  const profile = userData?.agentProfile || userData?.profile
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [agencyName, setAgencyName] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [licenseCountry, setLicenseCountry] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [website, setWebsite] = useState("")
  const [bio, setBio] = useState("")

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || userData?.name?.split(" ")[0] || "")
      setLastName(profile.lastName || userData?.name?.split(" ").slice(1).join(" ") || "")
      setAgencyName(profile.agencyName || "")
      setLicenseNumber(profile.licenseNumber || "")
      setLicenseCountry(profile.licenseCountry || "")
      setPhoneNumber(profile.phoneNumber || "")
      setWebsite(profile.website || "")
      setBio(profile.bio || "")
    }
  }, [profile, userData])

  const updateProfile = useMutation({
    mutationFn: async () => {
      const agentId = profile?.id
      if (!agentId) throw new Error("Profil agent introuvable")
      const body = {
        firstName,
        lastName,
        agencyName: agencyName || undefined,
        licenseNumber: licenseNumber || undefined,
        licenseCountry: licenseCountry || undefined,
        phoneNumber: phoneNumber || undefined,
        website: website || undefined,
        bio: bio || undefined,
      }
      const result = await api.patch(`/agents/${agentId}`, body)
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
        await api.post("/files/upload-direct", formData)
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
      <Text className="text-stadium-500 text-xs font-semibold uppercase tracking-wider px-6 mb-3 mt-2">
        Informations personnelles
      </Text>
      <View className="mx-4 bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-4">
        <InputField label="Prénom" value={firstName} onChangeText={setFirstName} />
        <InputField label="Nom" value={lastName} onChangeText={setLastName} last />
      </View>

      {/* Agency Info */}
      <Text className="text-stadium-500 text-xs font-semibold uppercase tracking-wider px-6 mb-3 mt-2">
        Informations agence
      </Text>
      <View className="mx-4 bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-4">
        <InputField label="Nom de l'agence" value={agencyName} onChangeText={setAgencyName} />
        <InputField label="Numéro de licence" value={licenseNumber} onChangeText={setLicenseNumber} />
        <InputField label="Pays de licence" value={licenseCountry} onChangeText={setLicenseCountry} last />
      </View>

      {/* Contact */}
      <Text className="text-stadium-500 text-xs font-semibold uppercase tracking-wider px-6 mb-3 mt-2">
        Contact
      </Text>
      <View className="mx-4 bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-4">
        <InputField label="Téléphone" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
        <InputField label="Site web" value={website} onChangeText={setWebsite} last />
      </View>

      {/* Bio */}
      <Text className="text-stadium-500 text-xs font-semibold uppercase tracking-wider px-6 mb-3 mt-2">
        Biographie
      </Text>
      <View className="mx-4 bg-stadium-900 border border-stadium-800 rounded-2xl p-4 mb-4">
        <TextInput
          className="text-white text-sm bg-stadium-800 rounded-xl px-4 py-3 border border-stadium-700 min-h-[100px]"
          value={bio}
          onChangeText={setBio}
          placeholder="Décrivez votre activité..."
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

function InputField({
  label,
  value,
  onChangeText,
  keyboardType,
  last,
}: {
  label: string
  value: string
  onChangeText: (text: string) => void
  keyboardType?: "default" | "phone-pad" | "email-address"
  last?: boolean
}) {
  return (
    <View className={last ? "" : "mb-3"}>
      <Text className="text-stadium-400 text-xs mb-1.5">{label}</Text>
      <TextInput
        className="text-white text-sm bg-stadium-800 rounded-xl px-4 py-3 border border-stadium-700"
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#52525b"
        keyboardType={keyboardType || "default"}
      />
    </View>
  )
}
