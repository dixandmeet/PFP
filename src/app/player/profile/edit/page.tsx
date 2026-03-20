"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AnimatePresence, motion } from "framer-motion"
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
import {
  Loader2,
  ArrowLeft,
  Upload,
  Camera,
  User,
  ImageIcon,
  CheckCircle2,
  X,
  PenLine,
  Building2,
  Ruler,
  Crosshair,
  FileText,
  ArrowUp,
} from "lucide-react"
import { updatePlayerProfileSchema } from "@/lib/validators/schemas"
import {
  NATIONALITIES,
  CLUBS,
  POSITIONS,
  PRO_LEAGUES,
  AMATEUR_LEAGUES,
  LEAGUE_TYPES,
} from "@/lib/constants/football-data"
import { cn } from "@/lib/utils"

type ProfileFormData = z.infer<typeof updatePlayerProfileSchema>

const FORM_ID = "player-profile-edit-form"

const EDIT_SECTIONS = [
  { id: "edit-photos", label: "Photos", Icon: Camera },
  { id: "edit-personal", label: "Identité", Icon: User },
  { id: "edit-situation", label: "Club", Icon: Building2 },
  { id: "edit-physical", label: "Physique", Icon: Ruler },
  { id: "edit-position", label: "Poste", Icon: Crosshair },
  { id: "edit-bio", label: "Bio", Icon: FileText },
] as const

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
  const [activeSection, setActiveSection] = useState<string>(EDIT_SECTIONS[0].id)
  const pageRootRef = useRef<HTMLDivElement>(null)
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const amateurLeagueNames = useMemo(
    () => new Set(AMATEUR_LEAGUES.map((l) => l.name)),
    []
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(updatePlayerProfileSchema),
  })

  const displayName = watch("displayName")
  const firstName = watch("firstName")
  const lastName = watch("lastName")

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const scrollToTopOfPage = useCallback(() => {
    scrollParent?.scrollTo({ top: 0, behavior: "smooth" })
  }, [scrollParent])

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

        if (profile.currentLeague && amateurLeagueNames.has(profile.currentLeague)) {
          setLeagueType("amateur")
        } else {
          setLeagueType("pro")
        }

        if (profile.profilePicture) setProfilePicturePreview(profile.profilePicture)
        if (profile.coverPhoto) setCoverPhotoPreview(profile.coverPhoto)
      } catch {
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
  }, [router, toast, setValue, amateurLeagueNames])

  useEffect(() => {
    if (loading) return
    const root = pageRootRef.current
    if (!root) return
    let p: HTMLElement | null = root.parentElement
    while (p) {
      const { overflowY } = getComputedStyle(p)
      if (overflowY === "auto" || overflowY === "scroll") {
        setScrollParent(p)
        return
      }
      p = p.parentElement
    }
    setScrollParent(document.documentElement)
  }, [loading])

  useEffect(() => {
    const sp = scrollParent
    if (!sp) return
    const readTop = () => (sp === document.documentElement ? window.scrollY : sp.scrollTop)
    const onScroll = () => setShowBackToTop(readTop() > 320)
    onScroll()
    sp.addEventListener("scroll", onScroll, { passive: true })
    return () => sp.removeEventListener("scroll", onScroll)
  }, [scrollParent])

  useEffect(() => {
    if (loading) return

    const elements = EDIT_SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      Boolean
    ) as HTMLElement[]
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) setActiveSection(visible[0].target.id)
      },
      { rootMargin: "-12% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [loading])

  const handlePhotoUpload = async (file: File, field: "profilePicture" | "coverPhoto") => {
    const isProfilePic = field === "profilePicture"
    const setUploading = isProfilePic ? setUploadingProfilePic : setUploadingCoverPhoto
    const setPreview = isProfilePic ? setProfilePicturePreview : setCoverPhotoPreview

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5 Mo",
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

      const localPreview = URL.createObjectURL(file)
      setPreview(localPreview)

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

      setValue(field, fileUrl)
      setPreview(fileUrl)

      URL.revokeObjectURL(localPreview)

      toast({
        title: "Succès",
        description: isProfilePic ? "Photo de profil téléchargée" : "Photo de couverture téléchargée",
      })
    } catch (error: unknown) {
      console.error("Upload error:", error)

      setPreview("")
      setValue(field, "")

      toast({
        title: "Erreur d'upload",
        description: error instanceof Error ? error.message : "Impossible de télécharger la photo",
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

      const submitData = {
        ...data,
        profilePicture: data.profilePicture || profilePicturePreview || "",
        coverPhoto: data.coverPhoto || coverPhotoPreview || "",
      }

      if (submitData.profilePicture?.startsWith("blob:")) submitData.profilePicture = ""
      if (submitData.coverPhoto?.startsWith("blob:")) submitData.coverPhoto = ""

      const response = await fetch(`/api/players/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la sauvegarde")
      }

      toast({
        title: "Profil enregistré",
        description: "Vos modifications sont visibles sur votre profil.",
      })

      router.push("/player/profile")
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder le profil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const titleHint =
    displayName?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    "Votre profil"

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50/80">
        <div className="text-center">
          <div className="mb-4 inline-flex rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <Loader2 className="h-8 w-8 animate-spin text-pitch-600" />
          </div>
          <p className="font-medium text-slate-600">Chargement de votre profil…</p>
          <p className="mt-1 text-sm text-slate-400">Préparation du formulaire</p>
        </div>
      </div>
    )
  }

  const SectionNav = ({ className }: { className?: string }) => (
    <nav className={cn("flex flex-col gap-0.5", className)} aria-label="Sections du formulaire">
      {EDIT_SECTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => scrollToSection(id)}
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all",
            activeSection === id
              ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <Icon className="h-4 w-4 shrink-0 opacity-90" />
          {label}
        </button>
      ))}
    </nav>
  )

  return (
    <div
      ref={pageRootRef}
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/30 max-md:pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-10"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm"
        >
          <div
            className={cn(
              "relative h-[180px] sm:h-[220px] md:h-[260px]",
              !coverPhotoPreview && "bg-gradient-to-br from-slate-800 via-slate-700 to-pitch-800"
            )}
          >
            {coverPhotoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPhotoPreview}
                alt=""
                className="h-full w-full object-cover object-center"
              />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push("/player/profile")}
              className="absolute left-3 top-3 border border-white/20 bg-black/25 text-white backdrop-blur-sm hover:bg-black/40 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>
          <div className="relative border-t border-slate-100 bg-white px-4 pb-6 pt-0 sm:px-6">
            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8 md:gap-10">
              {/* Colonne avatar : chevauchement bannière, alignée à gauche dès sm */}
              <div className="relative z-20 mx-auto shrink-0 sm:mx-0">
                <div
                  className={cn(
                    "h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-xl ring-1 ring-slate-200/80 sm:h-28 sm:w-28 sm:border-[5px]",
                    uploadingProfilePic && "opacity-90"
                  )}
                >
                  {profilePicturePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePicturePreview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-10 w-10 text-slate-300 sm:h-12 sm:w-12" />
                    </div>
                  )}
                </div>
                {uploadingProfilePic && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Grille : identité (remplit l’espace) + encart structurant */}
              <div className="relative z-20 grid min-w-0 flex-1 gap-5 sm:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] md:items-start md:gap-8">
                <div className="flex min-w-0 flex-col pt-4 sm:pt-6 md:pt-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-black/[0.06]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pitch-600 text-white shadow-sm">
                        <PenLine className="h-3 w-3" aria-hidden />
                      </span>
                      Édition du profil
                    </div>
                  </div>
                  <h1 className="mt-4 text-pretty text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:mt-5 md:mt-6 md:text-3xl">
                    {titleHint}
                  </h1>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-slate-600 md:mt-4 md:text-[15px]">
                    Mettez à jour vos visuels, votre identité et votre parcours. Les modifications sont
                    enregistrées lorsque vous appuyez sur <span className="font-medium text-slate-800">Enregistrer</span>.
                  </p>
                </div>

                <aside className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50/95 to-white px-4 pb-4 pt-4 shadow-sm sm:px-5 sm:pb-5 sm:pt-6 md:px-5 md:pb-5 md:pt-7">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Pour un profil percutant
                  </p>
                  <ul className="mt-3 space-y-2.5 text-sm leading-snug text-slate-600">
                    <li className="flex gap-2.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pitch-500" aria-hidden />
                      <span>Photo claire, bannière lisible (stade, équipe ou ambiance pro).</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pitch-500" aria-hidden />
                      <span>Poste et club à jour pour correspondre aux recherches des recruteurs.</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pitch-500" aria-hidden />
                      <span>Courte bio : forces sur le terrain et objectifs.</span>
                    </li>
                  </ul>
                </aside>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10 lg:items-start">
          <aside className="mb-5 hidden lg:block">
            <div className="sticky top-24 z-20 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Aller à
              </p>
              <SectionNav />
            </div>
          </aside>

          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
            <div className="sticky top-14 z-30 -mx-4 mb-6 border-b border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90 lg:hidden">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Sections
              </p>
              <div
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="tablist"
                aria-label="Navigation rapide"
              >
                {EDIT_SECTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={activeSection === id}
                    onClick={() => scrollToSection(id)}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                      activeSection === id
                        ? "bg-slate-900 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <form
              id={FORM_ID}
              onSubmit={handleSubmit(onSubmit, (formErrors) => {
                console.error("[PFP] Form validation errors:", formErrors)
                const first = Object.values(formErrors)[0]?.message
                toast({
                  title: "Champs incomplets",
                  description:
                    typeof first === "string"
                      ? first
                      : "Vérifiez les champs obligatoires (marqués *).",
                  variant: "destructive",
                })
              })}
              className="space-y-6"
            >
              <input type="hidden" {...register("profilePicture")} />
              <input type="hidden" {...register("coverPhoto")} />

              <section id="edit-photos" className="scroll-mt-32 lg:scroll-mt-28">
                <Card className="overflow-hidden rounded-2xl border-slate-200/90 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                      <Camera className="h-4 w-4 text-pitch-600" />
                      Photos & visibilité
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Ce bandeau reprend l’aperçu public : avatar rond et bannière large (recommandé 16:9).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 p-5 sm:p-6">
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-800">Photo de profil</Label>
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50 shadow-inner ring-1 ring-slate-200/80">
                              {profilePicturePreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={profilePicturePreview}
                                  alt="Aperçu photo de profil"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <User className="h-12 w-12 text-slate-300" />
                                </div>
                              )}
                              {uploadingProfilePic && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                              )}
                            </div>
                            {profilePicturePreview && !uploadingProfilePic && (
                              <button
                                type="button"
                                onClick={() => removePhoto("profilePicture")}
                                className="absolute -right-0.5 -top-0.5 rounded-full bg-red-500 p-1.5 text-white shadow-md transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                                aria-label="Supprimer la photo de profil"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="w-full max-w-xs">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handlePhotoUpload(file, "profilePicture")
                                e.target.value = ""
                              }}
                              className="hidden"
                              id="profilePicture"
                              disabled={uploadingProfilePic}
                            />
                            <label
                              htmlFor="profilePicture"
                              className={cn(
                                "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-center text-sm font-medium transition-all",
                                uploadingProfilePic
                                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                                  : "border-pitch-300/70 text-pitch-800 hover:border-pitch-500 hover:bg-pitch-50/50"
                              )}
                            >
                              {uploadingProfilePic ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin text-pitch-600" />
                                  Téléversement…
                                </>
                              ) : (
                                <>
                                  <Upload className="h-5 w-5 shrink-0 text-pitch-600" />
                                  {profilePicturePreview ? "Changer la photo" : "Ajouter une photo"}
                                </>
                              )}
                            </label>
                            <p className="mt-2 text-center text-xs text-slate-400">JPG, PNG, WebP, GIF — max 5 Mo</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-800">Photo de couverture</Label>
                        <div className="flex flex-col gap-4">
                          <div className="relative">
                            <div className="aspect-[21/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
                              {coverPhotoPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={coverPhotoPreview}
                                  alt="Aperçu couverture"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full min-h-[120px] items-center justify-center">
                                  <ImageIcon className="h-12 w-12 text-slate-300" />
                                </div>
                              )}
                              {uploadingCoverPhoto && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                              )}
                            </div>
                            {coverPhotoPreview && !uploadingCoverPhoto && (
                              <button
                                type="button"
                                onClick={() => removePhoto("coverPhoto")}
                                className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-md transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                                aria-label="Supprimer la photo de couverture"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="w-full">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handlePhotoUpload(file, "coverPhoto")
                                e.target.value = ""
                              }}
                              className="hidden"
                              id="coverPhoto"
                              disabled={uploadingCoverPhoto}
                            />
                            <label
                              htmlFor="coverPhoto"
                              className={cn(
                                "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-center text-sm font-medium transition-all",
                                uploadingCoverPhoto
                                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                                  : "border-pitch-300/70 text-pitch-800 hover:border-pitch-500 hover:bg-pitch-50/50"
                              )}
                            >
                              {uploadingCoverPhoto ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin text-pitch-600" />
                                  Téléversement…
                                </>
                              ) : (
                                <>
                                  <Upload className="h-5 w-5 shrink-0 text-pitch-600" />
                                  {coverPhotoPreview ? "Changer la couverture" : "Ajouter une couverture"}
                                </>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="edit-personal" className="scroll-mt-32 lg:scroll-mt-28">
                <Card className="overflow-hidden rounded-2xl border-slate-200/90 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                      <User className="h-4 w-4 text-pitch-600" />
                      Identité & nationalité
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Informations visibles sur votre fiche et pour les recruteurs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-slate-800">
                          Prénom <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          {...register("firstName")}
                          id="firstName"
                          className="h-11 rounded-xl border-slate-200 focus-visible:ring-pitch-500"
                          placeholder="Votre prénom"
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-600">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-slate-800">
                          Nom <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          {...register("lastName")}
                          id="lastName"
                          className="h-11 rounded-xl border-slate-200 focus-visible:ring-pitch-500"
                          placeholder="Votre nom"
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-sm font-medium text-slate-800">
                          Nom d&apos;affichage
                        </Label>
                        <Input
                          {...register("displayName")}
                          id="displayName"
                          className="h-11 rounded-xl border-slate-200 focus-visible:ring-pitch-500"
                          placeholder="Ex. K. Mbappé"
                        />
                        <p className="text-xs text-slate-500">Nom affiché sur le site (optionnel)</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-800">
                          Date de naissance <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          {...register("dateOfBirth")}
                          id="dateOfBirth"
                          className="h-11 rounded-xl border-slate-200 focus-visible:ring-pitch-500"
                        />
                        {errors.dateOfBirth && (
                          <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationality" className="text-sm font-medium text-slate-800">
                          Nationalité <span className="text-red-500">*</span>
                        </Label>
                        <select
                          {...register("nationality")}
                          id="nationality"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-pitch-500 focus:outline-none focus:ring-2 focus:ring-pitch-500/30"
                        >
                          <option value="">Sélectionner</option>
                          {NATIONALITIES.map((nat) => (
                            <option key={nat} value={nat}>
                              {nat}
                            </option>
                          ))}
                        </select>
                        {errors.nationality && (
                          <p className="text-sm text-red-600">{errors.nationality.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondNationality" className="text-sm font-medium text-slate-800">
                          Double nationalité
                        </Label>
                        <select
                          {...register("secondNationality")}
                          id="secondNationality"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-pitch-500 focus:outline-none focus:ring-2 focus:ring-pitch-500/30"
                        >
                          <option value="">Aucune</option>
                          {NATIONALITIES.map((nat) => (
                            <option key={nat} value={nat}>
                              {nat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="edit-situation" className="scroll-mt-32 lg:scroll-mt-28">
                <Card className="overflow-hidden rounded-2xl border-slate-200/90 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                      <Building2 className="h-4 w-4 text-pitch-600" />
                      Situation sportive
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Club et championnat — laissez « sans club » si vous êtes libre.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="currentClub" className="text-sm font-medium text-slate-800">
                          Club actuel
                        </Label>
                        <select
                          {...register("currentClub")}
                          id="currentClub"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-pitch-500 focus:outline-none focus:ring-2 focus:ring-pitch-500/30"
                        >
                          <option value="">Sans club / libre</option>
                          {(() => {
                            const countries = [...new Set(CLUBS.map((c) => c.country))]
                            return countries.map((country) => (
                              <optgroup key={country} label={country}>
                                {CLUBS.filter((c) => c.country === country).map((club) => (
                                  <option key={club.name} value={club.name}>
                                    {club.name}
                                  </option>
                                ))}
                              </optgroup>
                            ))
                          })()}
                        </select>
                        <p className="text-xs text-slate-500">Vide = joueur libre</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-800">Type de championnat</Label>
                        <div className="flex gap-2">
                          {LEAGUE_TYPES.map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => {
                                setLeagueType(type.value as "pro" | "amateur")
                                setValue("currentLeague", "")
                              }}
                              className={cn(
                                "min-h-[44px] flex-1 rounded-xl border-2 px-3 text-sm font-semibold transition-all",
                                leagueType === type.value
                                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                              )}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="currentLeague" className="text-sm font-medium text-slate-800">
                          Championnat
                        </Label>
                        <select
                          {...register("currentLeague")}
                          id="currentLeague"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-pitch-500 focus:outline-none focus:ring-2 focus:ring-pitch-500/30"
                        >
                          <option value="">Sélectionner un championnat</option>
                          {(() => {
                            const leagues = leagueType === "pro" ? PRO_LEAGUES : AMATEUR_LEAGUES
                            const countries = [...new Set(leagues.map((l) => l.country))]
                            return countries.map((country) => (
                              <optgroup key={country} label={country}>
                                {leagues
                                  .filter((l) => l.country === country)
                                  .map((league) => (
                                    <option key={`${league.country}-${league.name}`} value={league.name}>
                                      {league.name} (niv. {league.level})
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
              </section>

              <section id="edit-physical" className="scroll-mt-32 lg:scroll-mt-28">
                <Card className="overflow-hidden rounded-2xl border-slate-200/90 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                      <Ruler className="h-4 w-4 text-pitch-600" />
                      Mensurations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6">
                    <div className="grid gap-5 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-sm font-medium text-slate-800">
                          Taille (cm)
                        </Label>
                        <Input
                          type="number"
                          {...register("height", { setValueAs: (v: string) => (v === "" ? undefined : Number(v)) })}
                          id="height"
                          className="h-11 rounded-xl border-slate-200 focus-visible:ring-pitch-500"
                          placeholder="175"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-sm font-medium text-slate-800">
                          Poids (kg)
                        </Label>
                        <Input
                          type="number"
                          {...register("weight", { setValueAs: (v: string) => (v === "" ? undefined : Number(v)) })}
                          id="weight"
                          className="h-11 rounded-xl border-slate-200 focus-visible:ring-pitch-500"
                          placeholder="70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="strongFoot" className="text-sm font-medium text-slate-800">
                          Pied fort
                        </Label>
                        <select
                          {...register("strongFoot")}
                          id="strongFoot"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-pitch-500 focus:outline-none focus:ring-2 focus:ring-pitch-500/30"
                        >
                          <option value="">Sélectionner</option>
                          <option value="LEFT">Gauche</option>
                          <option value="RIGHT">Droit</option>
                          <option value="BOTH">Ambidextre</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="edit-position" className="scroll-mt-32 lg:scroll-mt-28">
                <Card className="overflow-hidden rounded-2xl border-slate-200/90 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                      <Crosshair className="h-4 w-4 text-pitch-600" />
                      Poste principal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryPosition" className="text-sm font-medium text-slate-800">
                        Position <span className="text-red-500">*</span>
                      </Label>
                      <select
                        {...register("primaryPosition")}
                        id="primaryPosition"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-pitch-500 focus:outline-none focus:ring-2 focus:ring-pitch-500/30"
                      >
                        <option value="">Sélectionner</option>
                        {["Gardien", "Défenseur", "Milieu", "Attaquant"].map((category) => (
                          <optgroup key={category} label={category}>
                            {POSITIONS.filter((p) => p.category === category).map((pos) => (
                              <option key={pos.code} value={pos.code}>
                                {pos.name} ({pos.code})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {errors.primaryPosition && (
                        <p className="text-sm text-red-600">{errors.primaryPosition.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(["Gardien", "Défenseur", "Milieu", "Attaquant"] as const).map((category) => {
                        const categoryPositions = POSITIONS.filter((p) => p.category === category)
                        const selectedPosition = watch("primaryPosition")
                        const isActive = categoryPositions.some((p) => p.code === selectedPosition)
                        return (
                          <div
                            key={category}
                            className={cn(
                              "rounded-xl border px-2 py-3 text-center text-xs font-semibold transition-all sm:text-sm",
                              isActive
                                ? "border-pitch-400 bg-pitch-50 text-pitch-900 ring-2 ring-pitch-500/25"
                                : "border-slate-200 bg-slate-50/50 text-slate-500"
                            )}
                          >
                            {category}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="edit-bio" className="scroll-mt-32 lg:scroll-mt-28">
                <Card className="overflow-hidden rounded-2xl border-slate-200/90 shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                      <FileText className="h-4 w-4 text-pitch-600" />
                      Présentation
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Quelques lignes qui résument votre jeu et vos objectifs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6">
                    <Textarea
                      {...register("bio")}
                      id="bio"
                      rows={6}
                      placeholder="Parcours, qualités sur le terrain, ambitions…"
                      className="min-h-[160px] resize-y rounded-xl border-slate-200 focus-visible:ring-pitch-500"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Astuce : soyez concret (poste, expérience, ce que vous recherchez).
                    </p>
                  </CardContent>
                </Card>
              </section>

              <motion.div
                className="hidden flex-col gap-2 pt-2 md:flex md:flex-row md:items-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Button
                  type="submit"
                  disabled={saving || uploadingProfilePic || uploadingCoverPhoto}
                  size="default"
                  className="w-full rounded-lg px-5 font-medium shadow-sm md:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => router.push("/player/profile")}
                  className="rounded-lg border-slate-200 px-5"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </Button>
              </motion.div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="fixed inset-x-0 z-50 border-t border-slate-200/90 bg-white/95 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom,0px))] pt-2.5 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md max-md:bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:hidden"
        role="region"
        aria-label="Actions du formulaire"
      >
        <div className="mx-auto flex max-w-6xl gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 rounded-lg border-slate-200 font-medium"
            onClick={() => router.push("/player/profile")}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={saving || uploadingProfilePic || uploadingCoverPhoto}
            size="sm"
            className="flex-[1.25] rounded-lg font-medium shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                …
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            aria-label="Remonter en haut de la page"
            onClick={scrollToTopOfPage}
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "fixed right-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-900 shadow-md ring-1 ring-black/[0.04] transition-colors hover:bg-slate-50",
              "max-md:bottom-[calc(4rem+4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-24 lg:bottom-8"
            )}
          >
            <ArrowUp className="h-4 w-4" aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
