"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/layout/PageHeader"
import { Loader2, Save, ArrowLeft, Upload } from "lucide-react"
import { updateAgentProfileSchema } from "@/lib/validators/schemas"

type ProfileFormData = z.infer<typeof updateAgentProfileSchema>

export default function AgentProfileEditPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [profileId, setProfileId] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(updateAgentProfileSchema),
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/users/me")
        if (!response.ok) throw new Error("Non authentifié")

        const userData = await response.json()
        if (!userData.agentProfile) {
          toast({
            title: "Erreur",
            description: "Profil agent non trouvé",
            variant: "destructive",
          })
          router.push("/agent/dashboard")
          return
        }

        const profile = userData.agentProfile
        setProfileId(profile.id)

        setValue("firstName", profile.firstName)
        setValue("lastName", profile.lastName)
        setValue("agencyName", profile.agencyName || "")
        setValue("licenseNumber", profile.licenseNumber || "")
        setValue("licenseCountry", profile.licenseCountry || "")
        setValue("bio", profile.bio || "")
        setValue("specialties", profile.specialties || [])
        setValue("phoneNumber", profile.phoneNumber || "")
        setValue("website", profile.website || "")
        setValue("profilePicture", profile.profilePicture || "")
        setValue("coverPhoto", profile.coverPhoto || "")
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil",
          variant: "destructive",
        })
        router.push("/agent/dashboard")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router, toast, setValue])

  const handlePhotoUpload = async (file: File, field: "profilePicture" | "coverPhoto") => {
    try {
      setUploadingPhoto(true)

      // Upload direct du fichier
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileType", "PROFILE_PICTURE")

      const uploadResponse = await fetch("/api/files/upload-direct", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error("Erreur lors de l'upload")

      const { url } = await uploadResponse.json()

      setValue(field, url)

      toast({
        title: "Succès",
        description: "Photo téléchargée avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la photo",
        variant: "destructive",
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true)

      const response = await fetch(`/api/agents/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la sauvegarde")
      }

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      })

      router.push("/agent/profile")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le profil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-pitch-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <PageHeader
        title="Modifier mon profil"
        subtitle="Mettez à jour vos informations professionnelles"
        icon={Save}
        action={
          <Button variant="outline" onClick={() => router.push("/agent/profile")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>Photo de profil et photo de couverture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Photo de profil</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePhotoUpload(file, "profilePicture")
                    }}
                    className="hidden"
                    id="profilePicture"
                    disabled={uploadingPhoto}
                  />
                  <label
                    htmlFor="profilePicture"
                    className="cursor-pointer flex items-center justify-center border-2 border-dashed border-stadium-300 rounded-lg p-4 hover:border-pitch-500 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-stadium-400 mb-2" />
                      <p className="text-sm text-stadium-600">
                        {watch("profilePicture") ? "Changer la photo" : "Télécharger une photo"}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <Label>Photo de couverture</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePhotoUpload(file, "coverPhoto")
                    }}
                    className="hidden"
                    id="coverPhoto"
                    disabled={uploadingPhoto}
                  />
                  <label
                    htmlFor="coverPhoto"
                    className="cursor-pointer flex items-center justify-center border-2 border-dashed border-stadium-300 rounded-lg p-4 hover:border-pitch-500 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-stadium-400 mb-2" />
                      <p className="text-sm text-stadium-600">
                        {watch("coverPhoto") ? "Changer la couverture" : "Télécharger une couverture"}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="agencyName">Nom de l'agence</Label>
                <Input {...register("agencyName")} />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Téléphone</Label>
                <Input {...register("phoneNumber")} />
              </div>

              <div>
                <Label htmlFor="licenseNumber">Numéro de licence</Label>
                <Input {...register("licenseNumber")} />
              </div>

              <div>
                <Label htmlFor="licenseCountry">Pays de licence</Label>
                <Input {...register("licenseCountry")} />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="website">Site web</Label>
                <Input {...register("website")} type="url" placeholder="https://..." />
                {errors.website && (
                  <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle>Biographie</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("bio")}
              rows={5}
              placeholder="Parlez de votre expérience, vos spécialités..."
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-white font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/agent/profile")}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
