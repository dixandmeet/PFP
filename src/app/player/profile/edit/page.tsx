"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import Image from "next/image"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/layout/PageHeader"
import { Loader2, Save, ArrowLeft, Upload, Camera, User, ImageIcon, CheckCircle2, X } from "lucide-react"
import { updatePlayerProfileSchema } from "@/lib/validators/schemas"
import { 
  NATIONALITIES, 
  CLUBS, 
  POSITIONS, 
  PRO_LEAGUES, 
  AMATEUR_LEAGUES,
  LEAGUE_TYPES 
} from "@/lib/constants/football-data"

type ProfileFormData = z.infer<typeof updatePlayerProfileSchema>

export default function PlayerProfileEditPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false)
  const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false)
  const [profileId, setProfileId] = useState("")
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("")
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>("")
  const [leagueType, setLeagueType] = useState<"pro" | "amateur">("pro")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(updatePlayerProfileSchema),
  })

  // Charger les données du profil
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/users/me")
        if (!response.ok) throw new Error("Non authentifié")

        const userData = await response.json()
        if (!userData.playerProfile) {
          toast({
            title: "Erreur",
            description: "Profil joueur non trouvé",
            variant: "destructive",
          })
          router.push("/player/dashboard")
          return
        }

        const profile = userData.playerProfile
        setProfileId(profile.id)

        // Remplir le formulaire
        setValue("firstName", profile.firstName)
        setValue("lastName", profile.lastName)
        setValue("displayName", profile.displayName || "")
        setValue("dateOfBirth", profile.dateOfBirth?.split("T")[0] || "")
        setValue("nationality", profile.nationality)
        setValue("secondNationality", profile.secondNationality || "")
        setValue("height", profile.height || undefined)
        setValue("weight", profile.weight || undefined)
        setValue("strongFoot", profile.strongFoot || undefined)
        setValue("primaryPosition", profile.primaryPosition)
        setValue("secondaryPositions", profile.secondaryPositions || [])
        setValue("bio", profile.bio || "")
        setValue("currentClub", profile.currentClub || "")
        setValue("currentLeague", profile.currentLeague || "")
        setValue("profilePicture", profile.profilePicture || "")
        setValue("coverPhoto", profile.coverPhoto || "")
        
        // Initialiser les aperçus
        if (profile.profilePicture) setProfilePicturePreview(profile.profilePicture)
        if (profile.coverPhoto) setCoverPhotoPreview(profile.coverPhoto)
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil",
          variant: "destructive",
        })
        router.push("/player/dashboard")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router, toast, setValue])

  const handlePhotoUpload = async (file: File, field: "profilePicture" | "coverPhoto") => {
    const isProfilePic = field === "profilePicture"
    const setUploading = isProfilePic ? setUploadingProfilePic : setUploadingCoverPhoto
    const setPreview = isProfilePic ? setProfilePicturePreview : setCoverPhotoPreview
    
    // Validation côté client
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5MB",
        variant: "destructive",
      })
      return
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Utilisez JPG, PNG, WebP ou GIF",
        variant: "destructive",
      })
      return
    }
    
    try {
      setUploading(true)
      
      // Créer un aperçu local immédiat
      const localPreview = URL.createObjectURL(file)
      setPreview(localPreview)

      // Upload direct du fichier
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileType", isProfilePic ? "PROFILE_PICTURE" : "COVER_PHOTO")

      

      const uploadResponse = await fetch("/api/files/upload-proxy", {
        method: "POST",
        body: formData,
      })

      const responseData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        console.error("Upload error response:", responseData)
        throw new Error(responseData.error || "Erreur lors de l'upload")
      }

      const fileUrl = responseData.fileAsset?.url || responseData.url

      // Mettre à jour le champ et l'aperçu avec l'URL serveur
      setValue(field, fileUrl)
      setPreview(fileUrl)
      
      // Nettoyer l'URL locale
      URL.revokeObjectURL(localPreview)

      toast({
        title: "Succès",
        description: isProfilePic ? "Photo de profil téléchargée" : "Photo de couverture téléchargée",
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      
      // En cas d'erreur, supprimer l'aperçu
      setPreview("")
      setValue(field, "")
      
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible de télécharger la photo",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }
  
  const removePhoto = (field: "profilePicture" | "coverPhoto") => {
    setValue(field, "")
    if (field === "profilePicture") {
      setProfilePicturePreview("")
    } else {
      setCoverPhotoPreview("")
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true)

      const response = await fetch(`/api/players/${profileId}`, {
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

      router.push("/player/profile")
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
        <div className="text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-pitch-100 to-pitch-50 rounded-full mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-pitch-600" />
          </div>
          <p className="text-stadium-600 font-medium">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl space-y-6">
      {/* Header amélioré */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stadium-200"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stadium-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pitch-500 to-pitch-600 rounded-lg shadow-md">
              <Save className="h-6 w-6 text-white" />
            </div>
            Modifier mon profil
          </h1>
          <p className="text-stadium-600 mt-1">Mettez à jour vos informations professionnelles</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/player/profile")}
          className="border-2 border-stadium-300 hover:bg-stadium-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au profil
        </Button>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photos */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pitch-50 to-stadium-50 border-b py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Camera className="h-4 w-4 text-pitch-600" />
              Photos
            </CardTitle>
            <CardDescription>Personnalisez votre profil avec vos photos</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Photo de profil */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Photo de profil</Label>
                <div className="flex flex-col items-center gap-4">
                  {/* Aperçu de la photo */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-pitch-200 overflow-hidden bg-gradient-to-br from-stadium-100 to-stadium-200 shadow-lg">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Photo de profil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-12 w-12 text-stadium-400" />
                        </div>
                      )}
                      {uploadingProfilePic && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    {profilePicturePreview && !uploadingProfilePic && (
                      <button
                        type="button"
                        onClick={() => removePhoto("profilePicture")}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Bouton upload */}
                  <div className="w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePhotoUpload(file, "profilePicture")
                      }}
                      className="hidden"
                      id="profilePicture"
                      disabled={uploadingProfilePic}
                    />
                    <label
                      htmlFor="profilePicture"
                      className={`cursor-pointer flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border-2 border-dashed transition-all ${
                        uploadingProfilePic 
                          ? "border-stadium-300 bg-stadium-50 cursor-not-allowed" 
                          : "border-pitch-300 hover:border-pitch-500 hover:bg-pitch-50"
                      }`}
                    >
                      {uploadingProfilePic ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin text-pitch-600" />
                          <span className="text-sm text-stadium-600">Téléchargement...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-pitch-600" />
                          <span className="text-sm font-medium text-pitch-700">
                            {profilePicturePreview ? "Changer la photo" : "Ajouter une photo"}
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Photo de couverture */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Photo de couverture</Label>
                <div className="flex flex-col gap-4">
                  {/* Aperçu de la couverture */}
                  <div className="relative">
                    <div className="w-full h-36 rounded-xl border-2 border-pitch-200 overflow-hidden bg-gradient-to-br from-stadium-100 to-stadium-200 shadow-lg">
                      {coverPhotoPreview ? (
                        <img
                          src={coverPhotoPreview}
                          alt="Photo de couverture"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-stadium-400" />
                        </div>
                      )}
                      {uploadingCoverPhoto && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    {coverPhotoPreview && !uploadingCoverPhoto && (
                      <button
                        type="button"
                        onClick={() => removePhoto("coverPhoto")}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Bouton upload */}
                  <div className="w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePhotoUpload(file, "coverPhoto")
                      }}
                      className="hidden"
                      id="coverPhoto"
                      disabled={uploadingCoverPhoto}
                    />
                    <label
                      htmlFor="coverPhoto"
                      className={`cursor-pointer flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border-2 border-dashed transition-all ${
                        uploadingCoverPhoto 
                          ? "border-stadium-300 bg-stadium-50 cursor-not-allowed" 
                          : "border-pitch-300 hover:border-pitch-500 hover:bg-pitch-50"
                      }`}
                    >
                      {uploadingCoverPhoto ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin text-pitch-600" />
                          <span className="text-sm text-stadium-600">Téléchargement...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-pitch-600" />
                          <span className="text-sm font-medium text-pitch-700">
                            {coverPhotoPreview ? "Changer la couverture" : "Ajouter une couverture"}
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations personnelles */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pitch-50 to-stadium-50 border-b py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <User className="h-4 w-4 text-pitch-600" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">Prénom <span className="text-red-500">*</span></Label>
                <Input 
                  {...register("firstName")} 
                  className="h-11 border-stadium-300 focus:border-pitch-500 focus:ring-pitch-500"
                  placeholder="Votre prénom"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Nom <span className="text-red-500">*</span></Label>
                <Input 
                  {...register("lastName")} 
                  className="h-11 border-stadium-300 focus:border-pitch-500 focus:ring-pitch-500"
                  placeholder="Votre nom"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium">Nom d'affichage</Label>
                <Input 
                  {...register("displayName")} 
                  className="h-11 border-stadium-300 focus:border-pitch-500 focus:ring-pitch-500"
                  placeholder="Ex: K. Mbappé"
                />
                <p className="text-xs text-stadium-500">Comment vous souhaitez être affiché sur le site</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date de naissance <span className="text-red-500">*</span></Label>
                <Input 
                  type="date" 
                  {...register("dateOfBirth")} 
                  className="h-11 border-stadium-300 focus:border-pitch-500 focus:ring-pitch-500"
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality" className="text-sm font-medium">Nationalité <span className="text-red-500">*</span></Label>
                <select
                  {...register("nationality")}
                  className="w-full h-11 px-3 border border-stadium-300 rounded-md focus:border-pitch-500 focus:ring-1 focus:ring-pitch-500 bg-white text-sm"
                >
                  <option value="">Sélectionner une nationalité</option>
                  {NATIONALITIES.map((nat) => (
                    <option key={nat} value={nat}>{nat}</option>
                  ))}
                </select>
                {errors.nationality && (
                  <p className="text-sm text-red-500">{errors.nationality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondNationality" className="text-sm font-medium">Seconde nationalité</Label>
                <select
                  {...register("secondNationality")}
                  className="w-full h-11 px-3 border border-stadium-300 rounded-md focus:border-pitch-500 focus:ring-1 focus:ring-pitch-500 bg-white text-sm"
                >
                  <option value="">Aucune</option>
                  {NATIONALITIES.map((nat) => (
                    <option key={nat} value={nat}>{nat}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Situation actuelle */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pitch-50 to-stadium-50 border-b py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <svg className="h-4 w-4 text-pitch-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Situation actuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="currentClub" className="text-sm font-medium">Club actuel</Label>
                <select
                  {...register("currentClub")}
                  className="w-full h-11 px-3 border border-stadium-300 rounded-md focus:border-pitch-500 focus:ring-1 focus:ring-pitch-500 bg-white text-sm"
                >
                  <option value="">Sans club / Libre</option>
                  {(() => {
                    const countries = [...new Set(CLUBS.map(c => c.country))]
                    return countries.map(country => (
                      <optgroup key={country} label={`🏳️ ${country}`}>
                        {CLUBS
                          .filter(c => c.country === country)
                          .map((club) => (
                            <option key={club.name} value={club.name}>
                              {club.name}
                            </option>
                          ))}
                      </optgroup>
                    ))
                  })()}
                </select>
                <p className="text-xs text-stadium-500">Laissez vide si vous êtes libre</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Type de championnat</Label>
                <div className="flex gap-2">
                  {LEAGUE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setLeagueType(type.value as "pro" | "amateur")
                        setValue("currentLeague", "")
                      }}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        leagueType === type.value
                          ? "border-pitch-500 bg-pitch-50 text-pitch-700"
                          : "border-stadium-200 bg-white text-stadium-600 hover:border-stadium-300"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="currentLeague" className="text-sm font-medium">Championnat actuel</Label>
                <select
                  {...register("currentLeague")}
                  className="w-full h-11 px-3 border border-stadium-300 rounded-md focus:border-pitch-500 focus:ring-1 focus:ring-pitch-500 bg-white text-sm"
                >
                  <option value="">Sélectionner un championnat</option>
                  {(() => {
                    const leagues = leagueType === "pro" ? PRO_LEAGUES : AMATEUR_LEAGUES
                    const countries = [...new Set(leagues.map(l => l.country))]
                    return countries.map(country => (
                      <optgroup key={country} label={`🏳️ ${country}`}>
                        {leagues
                          .filter(l => l.country === country)
                          .map((league) => (
                            <option key={`${league.country}-${league.name}`} value={league.name}>
                              {league.name} (Niveau {league.level})
                            </option>
                          ))}
                      </optgroup>
                    ))
                  })()}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Caractéristiques physiques - Suite du formulaire */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pitch-50 to-stadium-50 border-b py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <svg className="h-4 w-4 text-pitch-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Caractéristiques physiques
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="height" className="text-sm font-medium">Taille (cm)</Label>
                <Input 
                  type="number" 
                  {...register("height", { valueAsNumber: true })} 
                  className="h-11 border-stadium-300 focus:border-pitch-500 focus:ring-pitch-500"
                  placeholder="Ex: 175"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm font-medium">Poids (kg)</Label>
                <Input 
                  type="number" 
                  {...register("weight", { valueAsNumber: true })} 
                  className="h-11 border-stadium-300 focus:border-pitch-500 focus:ring-pitch-500"
                  placeholder="Ex: 70"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strongFoot" className="text-sm font-medium">Pied fort</Label>
                <select
                  {...register("strongFoot")}
                  className="w-full h-11 px-3 border border-stadium-300 rounded-md focus:border-pitch-500 focus:ring-1 focus:ring-pitch-500 bg-white text-sm"
                >
                  <option value="">Sélectionner</option>
                  <option value="LEFT">Gauche</option>
                  <option value="RIGHT">Droit</option>
                  <option value="BOTH">Les deux</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Position sur le terrain */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pitch-50 to-stadium-50 border-b py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <svg className="h-4 w-4 text-pitch-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="12" y1="3" x2="12" y2="17"/>
                <circle cx="12" cy="10" r="2"/>
              </svg>
              Position sur le terrain
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryPosition" className="text-sm font-medium">Position principale <span className="text-red-500">*</span></Label>
                <select
                  {...register("primaryPosition")}
                  className="w-full h-11 px-3 border border-stadium-300 rounded-md focus:border-pitch-500 focus:ring-1 focus:ring-pitch-500 bg-white text-sm"
                >
                  <option value="">Sélectionner une position</option>
                  {["Gardien", "Défenseur", "Milieu", "Attaquant"].map((category) => (
                    <optgroup key={category} label={category}>
                      {POSITIONS.filter(p => p.category === category).map((pos) => (
                        <option key={pos.code} value={pos.code}>
                          {pos.name} ({pos.code})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {errors.primaryPosition && (
                  <p className="text-sm text-red-500">{errors.primaryPosition.message}</p>
                )}
              </div>
              
              {/* Affichage visuel des catégories de position */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {["Gardien", "Défenseur", "Milieu", "Attaquant"].map((category) => {
                  const categoryPositions = POSITIONS.filter(p => p.category === category)
                  const selectedPosition = watch("primaryPosition")
                  const isActive = categoryPositions.some(p => p.code === selectedPosition)
                  
                  return (
                    <div
                      key={category}
                      className={`text-center p-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-pitch-100 text-pitch-700 border-2 border-pitch-300"
                          : "bg-stadium-50 text-stadium-500 border border-stadium-200"
                      }`}
                    >
                      {category}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biographie */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pitch-50 to-stadium-50 border-b py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <svg className="h-4 w-4 text-pitch-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Biographie
            </CardTitle>
            <CardDescription>Présentez-vous aux recruteurs et clubs</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              {...register("bio")}
              rows={6}
              placeholder="Parlez de votre parcours, vos objectifs, vos qualités sur le terrain..."
              className="border-stadium-300 focus:border-pitch-500 focus:ring-pitch-500 resize-none"
            />
            <p className="text-xs text-stadium-500 mt-2">
              Conseil : Mentionnez vos points forts, votre expérience et vos ambitions
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            type="submit"
            disabled={saving || uploadingProfilePic || uploadingCoverPhoto}
            size="lg"
            className="bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-white font-semibold shadow-lg flex-1 sm:flex-none"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Enregistrer les modifications
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push("/player/profile")}
            className="border-2 border-stadium-300 text-stadium-700 hover:bg-stadium-50"
          >
            <X className="mr-2 h-5 w-5" />
            Annuler
          </Button>
        </motion.div>
      </form>
    </div>
  )
}
