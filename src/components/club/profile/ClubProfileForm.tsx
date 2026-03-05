"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/layout/PageHeader"
import { ArrowLeft, Save, Clock, CheckCircle2, Circle } from "lucide-react"
import {
  createClubProfileSchema,
  type ClubProfileFormValues,
} from "@/lib/validators/schemas"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import { validateImageFile } from "@/lib/constants/upload"
import { calculateClubCompletion } from "@/lib/utils/club-completion"
import { ClubImagesSection } from "./ClubImagesSection"
import { ClubInfoSection } from "./ClubInfoSection"
import { UnsavedChangesBar } from "./UnsavedChangesBar"

// ─── Types ────────────────────────────────────────────────────────────────────

/** Données initiales du profil club, passées depuis le server component */
export interface ClubProfileInitialData {
  id: string
  clubName: string
  shortName: string | null
  clubType: string | null
  country: string
  city: string | null
  league: string | null
  division: string | null
  bio: string | null
  website: string | null
  foundedYear: number | null
  logo: string | null
  coverPhoto: string | null
  updatedAt: string | null
}

interface ClubProfileFormProps {
  initialData: ClubProfileInitialData
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function ClubProfileForm({ initialData }: ClubProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Dernière sauvegarde
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    initialData.updatedAt
      ? formatTime(new Date(initialData.updatedAt))
      : null
  )

  // Etats d'upload séparés pour logo et couverture
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  // Ref pour le form element (pour submit programmatique)
  const formRef = useRef<HTMLFormElement>(null)

  // ─── React Hook Form ────────────────────────────────────────────────────────

  const defaultValues: ClubProfileFormValues = {
    clubName: initialData.clubName,
    shortName: initialData.shortName ?? "",
    clubType: (initialData.clubType as ClubProfileFormValues["clubType"]) ?? undefined,
    country: initialData.country,
    city: initialData.city ?? "",
    league: initialData.league ?? "",
    division: initialData.division ?? "",
    bio: initialData.bio ?? "",
    website: initialData.website ?? "",
    foundedYear: initialData.foundedYear ?? undefined,
    logo: initialData.logo ?? "",
    coverPhoto: initialData.coverPhoto ?? "",
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ClubProfileFormValues>({
    resolver: zodResolver(createClubProfileSchema),
    defaultValues,
  })

  // ─── Unsaved changes ───────────────────────────────────────────────────────

  useUnsavedChanges(isDirty)

  // ─── Upload ─────────────────────────────────────────────────────────────────

  const handleUpload = useCallback(
    async (file: File, field: "logo" | "coverPhoto") => {
      const validationError = validateImageFile(file)
      if (validationError) {
        toast({
          title: "Fichier invalide",
          description: validationError,
          variant: "destructive",
        })
        return
      }

      const setUploading =
        field === "logo" ? setUploadingLogo : setUploadingCover

      try {
        setUploading(true)

        const formData = new FormData()
        formData.append("file", file)
        formData.append(
          "fileType",
          field === "logo" ? "CLUB_LOGO" : "CLUB_COVER"
        )

        const response = await fetch("/api/files/upload-direct", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || "Erreur lors de l'upload")
        }

        const { url } = await response.json()
        setValue(field, url, { shouldDirty: true })

        toast({
          title: "Image téléchargée",
          description:
            field === "logo"
              ? "Le logo a été mis à jour"
              : "La photo de couverture a été mise à jour",
        })
      } catch (error) {
        toast({
          title: "Erreur d'upload",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de télécharger l'image",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
      }
    },
    [setValue, toast]
  )

  const handleRemoveImage = useCallback(
    (field: "logo" | "coverPhoto") => {
      setValue(field, "", { shouldDirty: true })
    },
    [setValue]
  )

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = useCallback(
    async (data: ClubProfileFormValues) => {
      try {
        // Convertir les valeurs undefined et "" en null pour que JSON.stringify
        // les inclue dans le body (undefined est supprimé par JSON.stringify)
        const sanitized = {
          clubName: data.clubName,
          shortName: data.shortName || null,
          clubType: data.clubType ?? null,
          country: data.country,
          city: data.city || null,
          league: data.league || null,
          division: data.division || null,
          bio: data.bio || null,
          website: data.website || null,
          foundedYear: data.foundedYear ?? null,
          logo: data.logo || null,
          coverPhoto: data.coverPhoto || null,
        }

        const response = await fetch(`/api/clubs/${initialData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sanitized),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || "Erreur lors de la sauvegarde")
        }

        const now = formatTime(new Date())
        setLastSavedAt(now)

        // Reset le form avec les nouvelles valeurs (isDirty redevient false)
        reset(data)

        toast({
          title: "Profil club mis à jour",
          description: "Les modifications ont été enregistrées avec succès.",
        })
      } catch (error) {
        toast({
          title: "Erreur de sauvegarde",
          description:
            error instanceof Error
              ? error.message
              : "Impossible de sauvegarder le profil",
          variant: "destructive",
        })
      }
    },
    [initialData.id, reset, toast]
  )

  // ─── Cancel / Reset ─────────────────────────────────────────────────────────

  const handleCancel = useCallback(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

  // ─── Navigation retour ──────────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        "Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?"
      )
      if (!confirmed) return
    }
    router.push("/club/profile")
  }, [isDirty, router])

  // ─── Render ─────────────────────────────────────────────────────────────────

  const logoUrl = watch("logo")
  const coverPhotoUrl = watch("coverPhoto")

  // Calcul en temps réel de la complétion du profil
  const currentValues = watch()
  const { percentage: completionPct, fields: completionFields } = calculateClubCompletion({
    clubName: currentValues.clubName,
    shortName: currentValues.shortName,
    clubType: currentValues.clubType,
    logo: currentValues.logo,
    coverPhoto: currentValues.coverPhoto,
    country: currentValues.country,
    city: currentValues.city,
    bio: currentValues.bio,
    foundedYear: currentValues.foundedYear,
  })

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <PageHeader
        title="Modifier mon profil"
        subtitle="Mettez a jour les informations de votre club"
        icon={Save}
        action={
          <Button
            variant="outline"
            onClick={handleBack}
            animated={false}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        }
      />

      {/* Dernière sauvegarde */}
      {lastSavedAt && (
        <div className="flex items-center gap-1.5 text-xs text-stadium-500 mb-2">
          <Clock className="h-3.5 w-3.5" />
          <span>Derniere sauvegarde : {lastSavedAt}</span>
        </div>
      )}

      {/* Barre de complétion en temps réel */}
      <div className="mb-6 p-4 rounded-xl bg-white border border-stadium-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-stadium-700">Completion du profil</span>
          <span className={`text-sm font-bold ${completionPct === 100 ? "text-pitch-600" : "text-stadium-600"}`}>
            {completionPct}%
          </span>
        </div>
        <div className="h-2 bg-stadium-100 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completionPct === 100
                ? "bg-pitch-500"
                : completionPct >= 50
                  ? "bg-amber-400"
                  : "bg-orange-400"
            }`}
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {completionFields.map((field) => (
            <span
              key={field.id}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                field.completed
                  ? "bg-pitch-50 text-pitch-600"
                  : "bg-stadium-50 text-stadium-500"
              }`}
            >
              {field.completed ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
              {field.label}
            </span>
          ))}
        </div>
      </div>

      {/* Formulaire */}
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        {/* Section Images */}
        <ClubImagesSection
          logoUrl={logoUrl ?? undefined}
          coverPhotoUrl={coverPhotoUrl ?? undefined}
          uploadingLogo={uploadingLogo}
          uploadingCover={uploadingCover}
          onUploadLogo={(file) => handleUpload(file, "logo")}
          onUploadCover={(file) => handleUpload(file, "coverPhoto")}
          onRemoveLogo={() => handleRemoveImage("logo")}
          onRemoveCover={() => handleRemoveImage("coverPhoto")}
        />

        {/* Section Informations + Bio */}
        <ClubInfoSection
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
        />
      </form>

      {/* Barre sticky modifications non enregistrées */}
      <UnsavedChangesBar
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onSave={() => formRef.current?.requestSubmit()}
        onCancel={handleCancel}
      />
    </div>
  )
}
