"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  User,
  Upload,
  X,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const staffProfileSchema = z.object({
  firstName: z.preprocess(
    (v) => (v === undefined || v === null ? "" : String(v).trim()),
    z.string().min(1, "Prénom requis").max(100)
  ),
  lastName: z.preprocess(
    (v) => (v === undefined || v === null ? "" : String(v).trim()),
    z.string().min(1, "Nom requis").max(100)
  ),
  jobTitle: z
    .string()
    .max(200)
    .optional()
    .transform((v) => v?.trim() || ""),
  bio: z
    .string()
    .max(2000)
    .optional()
    .transform((v) => v?.trim() || ""),
  phone: z
    .string()
    .max(30)
    .optional()
    .transform((v) => v?.trim() || ""),
  profilePicture: z.string().optional().nullable(),
})

export type StaffProfileFormData = z.infer<typeof staffProfileSchema>

export function StaffProfileSectionInfo() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<StaffProfileFormData>({
    resolver: zodResolver(staffProfileSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      jobTitle: "",
      bio: "",
      phone: "",
      profilePicture: "",
    },
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/club/staff/profile")
        if (res.ok) {
          const data = await res.json()
          const values = {
            firstName: String(data.firstName ?? "").trim() || "",
            lastName: String(data.lastName ?? "").trim() || "",
            jobTitle: data.jobTitle ?? "",
            bio: data.bio ?? "",
            phone: data.phone ?? "",
            profilePicture: data.profilePicture ?? "",
          }
          form.reset(values, { keepErrors: false })
          form.clearErrors()
        }
      } catch {
        setError("Erreur lors du chargement du profil")
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [form])

  const handlePhotoUpload = useCallback(
    async (file: File) => {
      try {
        setUploadingPhoto(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("fileType", "PROFILE_PICTURE")
        const res = await fetch("/api/files/upload-direct", {
          method: "POST",
          body: formData,
        })
        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.error || "Erreur lors de l'upload")
        }
        const { url } = await res.json()
        form.setValue("profilePicture", url)
        toast({
          title: "Succès",
          description: "Photo de profil téléchargée",
        })
      } catch (err: unknown) {
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Impossible de télécharger la photo",
          variant: "destructive",
        })
      } finally {
        setUploadingPhoto(false)
      }
    },
    [form, toast]
  )

  const removePhoto = useCallback(() => {
    form.setValue("profilePicture", "")
  }, [form])

  const handleSave = useCallback(
    async (data: StaffProfileFormData) => {
      setSaving(true)
      setError("")
      setSuccess(false)
      try {
        const res = await fetch("/api/club/staff/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const json = await res.json()
          setError(json.error || "Erreur lors de la sauvegarde")
          return
        }
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch {
        setError("Erreur de connexion au serveur")
      } finally {
        setSaving(false)
      }
    },
    []
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-pitch-500" />
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-stadium-100 border-2 border-stadium-200 flex items-center justify-center overflow-hidden shrink-0">
            {form.watch("profilePicture") ? (
              <img
                src={form.watch("profilePicture") || undefined}
                alt="Photo de profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-stadium-400" />
            )}
          </div>
          {form.watch("profilePicture") && !uploadingPhoto && (
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
              aria-label="Supprimer la photo"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium text-gray-700">Photo de profil</Label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handlePhotoUpload(file)
              e.target.value = ""
            }}
            className="hidden"
            id="staff-profile-picture"
            disabled={uploadingPhoto}
          />
          <label
            htmlFor="staff-profile-picture"
            className="mt-2 cursor-pointer inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-stadium-300 px-4 py-2 text-sm text-stadium-600 hover:border-pitch-500 hover:bg-stadium-50 transition-colors"
          >
            {uploadingPhoto ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>
              {uploadingPhoto
                ? "Téléchargement…"
                : form.watch("profilePicture")
                  ? "Changer la photo"
                  : "Ajouter une photo"}
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP ou GIF. Max 10 Mo.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Prénom *</Label>
          <Controller
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <Input
                id="firstName"
                placeholder="Jean"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                className="mt-1"
              />
            )}
          />
          {form.formState.errors.firstName?.message && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Nom *</Label>
          <Controller
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <Input
                id="lastName"
                placeholder="Dupont"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                className="mt-1"
              />
            )}
          />
          {form.formState.errors.lastName?.message && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="jobTitle">Poste / Fonction</Label>
        <Controller
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <Input
              id="jobTitle"
              placeholder="Directeur Sportif, Entraîneur, Scout..."
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              className="mt-1"
            />
          )}
        />
      </div>

      <div>
        <Label htmlFor="phone">Téléphone</Label>
        <Controller
          control={form.control}
          name="phone"
          render={({ field }) => (
            <Input
              id="phone"
              type="tel"
              placeholder="+33 6 12 34 56 78"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              className="mt-1"
            />
          )}
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio / Présentation</Label>
        <textarea
          id="bio"
          rows={4}
          placeholder="Décrivez votre parcours et votre rôle au sein du club..."
          {...form.register("bio")}
          className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{(form.watch("bio") || "").length}/2000 caractères</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">Profil sauvegardé avec succès.</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer
        </Button>
      </div>
    </form>
  )
}
