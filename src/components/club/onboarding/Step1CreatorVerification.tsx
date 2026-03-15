"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  searchUserSchema,
  verifyOtpSchema,
  createCreatorSchema,
  type SearchUserInput,
  type VerifyOtpInput,
  type CreateCreatorInput,
} from "@/lib/validators/club-onboarding-schemas"
import {
  Search,
  Mail,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Send,
  RefreshCw,
  Info,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

type UserSearchResult = {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
  role: string
} | null

type Step1State =
  | "idle"
  | "searching"
  | "not_found"
  | "found_unverified"
  | "found_verified"
  | "creating_account"
  | "creator_created"
  | "inviting"
  | "invite_sent"
  | "resending_verification"
  | "verification_resent"
  | "sending_otp"
  | "otp_sent"
  | "verifying_otp"
  | "otp_verified"

interface Step1Props {
  onVerified: (email: string) => void
}

// ─── Composant principal ─────────────────────────────────────────────────────

export function Step1CreatorVerification({ onVerified }: Step1Props) {
  const [state, setState] = useState<Step1State>("idle")
  const [foundUser, setFoundUser] = useState<UserSearchResult>(null)
  const [searchedEmail, setSearchedEmail] = useState("")
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  // ─── Forms ───────────────────────────────────────────────────────────────

  const searchForm = useForm<SearchUserInput>({
    resolver: zodResolver(searchUserSchema),
    defaultValues: { email: "" },
  })

  const otpForm = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: "", code: "" },
  })

  const createForm = useForm<CreateCreatorInput>({
    resolver: zodResolver(createCreatorSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "" },
  })

  // ─── Recherche utilisateur ───────────────────────────────────────────────

  const handleSearch = useCallback(
    async (data: SearchUserInput) => {
      setState("searching")
      setError("")
      setFoundUser(null)
      setSearchedEmail(data.email)

      try {
        const res = await fetch(
          `/api/users/search?email=${encodeURIComponent(data.email)}`
        )
        const json = await res.json()

        if (!res.ok) {
          setError(json.error || "Erreur lors de la recherche")
          setState("idle")
          return
        }

        if (!json.found) {
          // User n'existe pas
          setState("not_found")
          // Pré-remplir l'email dans le formulaire de création
          createForm.setValue("email", data.email)
          return
        }

        // User trouvé
        setFoundUser(json.user)

        if (json.canSendOtp) {
          // Email vérifié → on peut envoyer un OTP
          setState("found_verified")
          otpForm.setValue("email", json.user.email)
        } else {
          // Email non vérifié → bloquer
          setState("found_unverified")
        }
      } catch {
        setError("Erreur de connexion au serveur")
        setState("idle")
      }
    },
    [createForm, otpForm]
  )

  // ─── Envoi OTP ───────────────────────────────────────────────────────────

  const handleSendOtp = useCallback(async () => {
    if (!foundUser) return
    setState("sending_otp")
    setError("")

    try {
      const res = await fetch("/api/onboarding/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: foundUser.email }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Erreur lors de l'envoi du code")
        setState("found_verified")
        return
      }

      setState("otp_sent")
    } catch {
      setError("Erreur de connexion au serveur")
      setState("found_verified")
    }
  }, [foundUser])

  // ─── Vérification OTP ────────────────────────────────────────────────────

  const handleVerifyOtp = useCallback(
    async (data: VerifyOtpInput) => {
      setState("verifying_otp")
      setError("")

      try {
        const res = await fetch("/api/onboarding/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, code: data.code }),
        })
        const json = await res.json()

        if (!res.ok) {
          setError(json.error || "Code invalide")
          setState("otp_sent")
          return
        }

        if (json.valid) {
          setState("otp_verified")
          onVerified(data.email)
        }
      } catch {
        setError("Erreur de connexion au serveur")
        setState("otp_sent")
      }
    },
    [onVerified]
  )

  // ─── Création du compte créateur ─────────────────────────────────────────

  const handleCreateCreator = useCallback(
    async (data: CreateCreatorInput) => {
      setState("creating_account")
      setError("")

      try {
        const res = await fetch("/api/users/create-creator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        const json = await res.json()

        if (!res.ok) {
          if (json.code === "EMAIL_TAKEN") {
            setError(
              "Un compte existe déjà avec cet email. Relancez la recherche."
            )
          } else {
            setError(json.error || "Erreur lors de la création du compte")
          }
          setState("not_found")
          return
        }

        setDialogOpen(false)
        setState("creator_created")
        setSearchedEmail(data.email)
      } catch {
        setError("Erreur de connexion au serveur")
        setState("not_found")
      }
    },
    []
  )

  // ─── Invitation par email ────────────────────────────────────────────────

  const handleInvite = useCallback(async () => {
    setState("inviting")
    setError("")

    try {
      const res = await fetch("/api/invitations/creator/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: searchedEmail }),
      })
      const json = await res.json()

      if (!res.ok) {
        if (json.code === "USER_EXISTS") {
          setError(json.error)
          setState("not_found")
        } else {
          setError(json.error || "Erreur lors de l'envoi de l'invitation")
          setState("not_found")
        }
        return
      }

      setState("invite_sent")
    } catch {
      setError("Erreur de connexion au serveur")
      setState("not_found")
    }
  }, [searchedEmail])

  // ─── Renvoi email de vérification ────────────────────────────────────────

  const handleResendVerification = useCallback(async () => {
    if (!foundUser) return
    setState("resending_verification")
    setError("")

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: foundUser.email }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Erreur lors du renvoi")
        setState("found_unverified")
        return
      }

      setState("verification_resent")
    } catch {
      setError("Erreur de connexion au serveur")
      setState("found_unverified")
    }
  }, [foundUser])

  // ─── Reset complet ───────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setState("idle")
    setFoundUser(null)
    setSearchedEmail("")
    setError("")
    searchForm.reset()
    otpForm.reset()
    createForm.reset()
  }, [searchForm, otpForm, createForm])

  // ─── Render ──────────────────────────────────────────────────────────────

  const isLoading =
    state === "searching" ||
    state === "creating_account" ||
    state === "inviting" ||
    state === "resending_verification" ||
    state === "sending_otp" ||
    state === "verifying_otp"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Vérification du créateur
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Identifiez et vérifiez la personne responsable de la création du club.
        </p>
      </div>

      {/* ═══ Phase OTP (après envoi) ═══ */}
      {(state === "otp_sent" || state === "verifying_otp") && (
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <Mail className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Code envoyé !</AlertTitle>
            <AlertDescription className="text-green-700">
              Un code à 6 chiffres a été envoyé à{" "}
              <strong>{foundUser?.email}</strong>. Il expire dans 10 minutes.
            </AlertDescription>
          </Alert>

          <form
            onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="otp-code">Code de vérification</Label>
              <Input
                id="otp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                {...otpForm.register("code")}
                className="mt-1 text-center text-2xl tracking-[0.5em] font-mono"
              />
              {otpForm.formState.errors.code && (
                <p className="text-sm text-red-500 mt-1">
                  {otpForm.formState.errors.code.message}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleReset}>
                Retour
              </Button>
              <Button
                type="submit"
                disabled={state === "verifying_otp"}
                className="flex-1"
              >
                {state === "verifying_otp" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                )}
                Vérifier le code
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={state === "verifying_otp"}
                className="text-sm text-green-600 hover:text-green-700 underline"
              >
                Renvoyer le code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══ Phase OTP vérifié (succès) ═══ */}
      {state === "otp_verified" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">
            Créateur vérifié avec succès
          </AlertTitle>
          <AlertDescription className="text-green-700">
            L&apos;identité de{" "}
            <strong>{foundUser?.name || foundUser?.email}</strong> a été
            confirmée. Vous pouvez passer à l&apos;étape suivante.
          </AlertDescription>
        </Alert>
      )}

      {/* ═══ Phase recherche + résultats ═══ */}
      {state !== "otp_sent" &&
        state !== "verifying_otp" &&
        state !== "otp_verified" && (
          <div className="space-y-4">
            {/* Formulaire de recherche */}
            <form
              onSubmit={searchForm.handleSubmit(handleSearch)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="search-email">Email du créateur</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="search-email"
                    type="email"
                    placeholder="email@exemple.com"
                    {...searchForm.register("email")}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {state === "searching" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">Rechercher</span>
                  </Button>
                </div>
                {searchForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {searchForm.formState.errors.email.message}
                  </p>
                )}
              </div>
            </form>

            {/* Erreur générale */}
            {error &&
              state !== "creator_created" &&
              state !== "invite_sent" &&
              state !== "verification_resent" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

            {/* ─── État : USER NOT FOUND ─── */}
            {(state === "not_found" || state === "inviting") && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Aucun utilisateur trouvé</AlertTitle>
                  <AlertDescription>
                    Aucun utilisateur trouvé avec l&apos;email{" "}
                    <strong>{searchedEmail}</strong>.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="default"
                    className="flex-1"
                    disabled={state === "inviting"}
                    onClick={() => {
                      setError("")
                      setDialogOpen(true)
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer le compte du créateur
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleInvite}
                    disabled={state === "inviting"}
                  >
                    {state === "inviting" ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Inviter cet email
                  </Button>
                </div>
              </div>
            )}

            {/* ─── État : INVITATION ENVOYÉE ─── */}
            {state === "invite_sent" && (
              <Alert className="border-blue-200 bg-blue-50">
                <Send className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">
                  Invitation envoyée
                </AlertTitle>
                <AlertDescription className="text-blue-700">
                  Un email d&apos;invitation a été envoyé à{" "}
                  <strong>{searchedEmail}</strong>. Le créateur doit créer son
                  compte et vérifier son email avant de pouvoir continuer.
                </AlertDescription>
              </Alert>
            )}

            {/* ─── État : COMPTE CRÉÉ (en attente vérification) ─── */}
            {state === "creator_created" && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">
                  Compte créé avec succès
                </AlertTitle>
                <AlertDescription className="text-blue-700">
                  Le compte a été créé pour <strong>{searchedEmail}</strong>. Le
                  créateur doit vérifier son email pour continuer. Un email de
                  vérification lui a été envoyé.
                  <br />
                  <button
                    type="button"
                    onClick={() => {
                      searchForm.setValue("email", searchedEmail)
                      searchForm.handleSubmit(handleSearch)()
                    }}
                    className="mt-2 text-sm text-blue-700 hover:text-blue-800 underline font-medium"
                  >
                    Relancer la recherche pour vérifier
                  </button>
                </AlertDescription>
              </Alert>
            )}

            {/* ─── État : USER TROUVÉ MAIS EMAIL NON VÉRIFIÉ ─── */}
            {(state === "found_unverified" ||
              state === "resending_verification" ||
              state === "verification_resent") && (
              <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/50 space-y-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {foundUser?.name || "Utilisateur"}
                    </p>
                    <p className="text-sm text-gray-500">{foundUser?.email}</p>
                  </div>
                </div>

                <Alert className="border-amber-300 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">
                    Email non vérifié
                  </AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Cet utilisateur doit d&apos;abord vérifier son adresse email
                    avant de pouvoir continuer l&apos;onboarding.
                  </AlertDescription>
                </Alert>

                {state === "verification_resent" ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">
                      Email de vérification renvoyé
                    </AlertTitle>
                    <AlertDescription className="text-green-700">
                      Un nouvel email de vérification a été envoyé à{" "}
                      <strong>{foundUser?.email}</strong>.
                      <br />
                      <button
                        type="button"
                        onClick={() => {
                          if (foundUser?.email) {
                            searchForm.setValue("email", foundUser.email)
                            searchForm.handleSubmit(handleSearch)()
                          }
                        }}
                        className="mt-2 text-sm text-green-700 hover:text-green-800 underline font-medium"
                      >
                        Relancer la recherche après vérification
                      </button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleResendVerification}
                    disabled={state === "resending_verification"}
                    className="w-full"
                  >
                    {state === "resending_verification" ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Renvoyer le mail de vérification
                  </Button>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* ─── État : USER TROUVÉ + EMAIL VÉRIFIÉ ─── */}
            {(state === "found_verified" || state === "sending_otp") && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/30 space-y-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {foundUser?.name || "Utilisateur"}
                    </p>
                    <p className="text-sm text-gray-500">{foundUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Email vérifié</span>
                </div>

                <Button
                  onClick={handleSendOtp}
                  disabled={state === "sending_otp"}
                  className="w-full"
                >
                  {state === "sending_otp" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 mr-2" />
                  )}
                  Envoyer un code de vérification
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

      {/* ═══ Dialog : Création du compte créateur ═══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer le compte du créateur</DialogTitle>
            <DialogDescription>
              Remplissez les informations du créateur. Un email de vérification
              lui sera envoyé automatiquement.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={createForm.handleSubmit(handleCreateCreator)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-firstName">Prénom *</Label>
                <Input
                  id="create-firstName"
                  placeholder="Jean"
                  {...createForm.register("firstName")}
                  className="mt-1"
                />
                {createForm.formState.errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {createForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="create-lastName">Nom *</Label>
                <Input
                  id="create-lastName"
                  placeholder="Dupont"
                  {...createForm.register("lastName")}
                  className="mt-1"
                />
                {createForm.formState.errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">
                    {createForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="email@exemple.com"
                {...createForm.register("email")}
                className="mt-1"
              />
              {createForm.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {createForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="create-phone">
                Téléphone{" "}
                <span className="text-gray-400 font-normal">(optionnel)</span>
              </Label>
              <Input
                id="create-phone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                {...createForm.register("phone")}
                className="mt-1"
              />
              {createForm.formState.errors.phone && (
                <p className="text-sm text-red-500 mt-1">
                  {createForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            {error && state === "creating_account" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button type="submit" disabled={state === "creating_account"} className="w-full">
                {state === "creating_account" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Créer et envoyer le mail d&apos;activation
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={state === "creating_account"}
                className="w-full"
              >
                Annuler
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
