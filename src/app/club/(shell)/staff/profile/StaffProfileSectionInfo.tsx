"use client"

import { useEffect, useState, useCallback, useRef } from "react"
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
  Camera,
  X,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

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
  const [dragOver, setDragOver] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          title: "Photo mise à jour",
          description: "Votre photo de profil a été enregistrée.",
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

  const handleFileSelect = useCallback(
    (file: File | undefined) => {
      if (file && file.type.startsWith("image/")) {
        handlePhotoUpload(file)
      }
    },
    [handlePhotoUpload]
  )

  const removePhoto = useCallback(() => {
    form.setValue("profilePicture", "")
  }, [form])

  const handleSave = useCallback(async (data: StaffProfileFormData) => {
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
  }, [])

  const profilePicture = form.watch("profilePicture")
  const bioLength = (form.watch("bio") || "").length

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pitch-500" />
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed p-5 transition-colors sm:p-6",
          dragOver
            ? "border-pitch-400 bg-pitch-50/50"
            : "border-stadium-200 bg-stadium-50/50 hover:border-stadium-300"
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFileSelect(e.dataTransfer.files[0])
        }}
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="group relative shrink-0">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-sm ring-1 ring-stadium-200">
              {profilePicture ? (
                <img src={profilePicture} alt="Photo de profil" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-stadium-300" />
              )}
            </div>
            {profilePicture && !uploadingPhoto && (
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-stadium-800/80 text-white opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-red-600"
                aria-label="Supprimer la photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-medium text-stadium-800">Photo de profil</p>
            <p className="mt-1 text-xs text-stadium-400">
              Glissez une image ici ou utilisez le bouton ci-dessous. JPG, PNG, WebP ou GIF — max 10 Mo.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={(e) => {
                handleFileSelect(e.target.files?.[0])
                e.target.value = ""
              }}
              className="hidden"
              disabled={uploadingPhoto}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 gap-2"
            >
              {uploadingPhoto ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : profilePicture ? (
                <Camera className="h-4 w-4" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploadingPhoto ? "Téléchargement…" : profilePicture ? "Changer la photo" : "Ajouter une photo"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-stadium-700">
            Prénom <span className="text-red-500">*</span>
          </Label>
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
              />
            )}
          />
          {form.formState.errors.firstName?.message && (
            <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-stadium-700">
            Nom <span className="text-red-500">*</span>
          </Label>
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
              />
            )}
          />
          {form.formState.errors.lastName?.message && (
            <p className="text-xs text-red-500">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="jobTitle" className="text-stadium-700">
          Poste / Fonction
        </Label>
        <Controller
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <Input
              id="jobTitle"
              placeholder="Directeur sportif, entraîneur, scout…"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-stadium-700">
          Téléphone
        </Label>
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
            />
          )}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio" className="text-stadium-700">
            Bio / Présentation
          </Label>
          <span
            className={cn(
              "text-xs tabular-nums",
              bioLength > 1900 ? "text-amber-600" : "text-stadium-400"
            )}
          >
            {bioLength}/2000
          </span>
        </div>
        <textarea
          id="bio"
          rows={4}
          placeholder="Décrivez votre parcours et votre rôle au sein du club…"
          {...form.register("bio")}
          className="flex w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-pitch-200 bg-pitch-50">
          <CheckCircle2 className="h-4 w-4 text-pitch-600" />
          <AlertDescription className="text-pitch-700">
            Profil sauvegardé avec succès.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end border-t border-stadium-100 pt-5">
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </Button>
      </div>
    </form>
  )
}
