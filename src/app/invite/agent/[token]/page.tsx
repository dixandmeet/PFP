"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2,
  Award,
  Phone,
  Lock,
  ArrowRight,
  Shield,
} from "lucide-react"
import { FootballIcon } from "@/components/auth/icons"

interface InvitationData {
  agentEmail: string
  agentFirstName: string | null
  agentLastName: string | null
  agentPhone: string | null
  player: {
    name: string
    position: string | null
    club: string | null
    profilePicture: string | null
  }
}

type PageState = "loading" | "valid" | "expired" | "used" | "error"

export default function AgentInvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [pageState, setPageState] = useState<PageState>("loading")
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    agencyName: "",
    licenseNumber: "",
    licenseCountry: "",
    phoneNumber: "",
    bio: "",
  })

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/invitations/agent/verify?token=${token}`)
        const data = await res.json()

        if (!res.ok) {
          if (data.status === "ACCEPTED") {
            setPageState("used")
          } else if (res.status === 410) {
            setPageState("expired")
          } else {
            setPageState("error")
            setErrorMessage(data.error || "Invitation invalide")
          }
          return
        }

        setInvitation(data.invitation)
        setForm((prev) => ({
          ...prev,
          firstName: data.invitation.agentFirstName || "",
          lastName: data.invitation.agentLastName || "",
          phoneNumber: data.invitation.agentPhone || "",
        }))
        setPageState("valid")
      } catch {
        setPageState("error")
        setErrorMessage("Impossible de vérifier l'invitation")
      }
    }
    verify()
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" })
      return
    }
    if (form.password.length < 8) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 8 caractères", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/invitations/agent/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          agencyName: form.agencyName || undefined,
          licenseNumber: form.licenseNumber || undefined,
          licenseCountry: form.licenseCountry || undefined,
          phoneNumber: form.phoneNumber || undefined,
          bio: form.bio || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: "Erreur", description: data.error, variant: "destructive" })
        setSaving(false)
        return
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: form.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push("/agent/dashboard")
      } else {
        toast({ title: "Compte créé", description: "Connectez-vous avec vos identifiants" })
        router.push("/login")
      }
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue", variant: "destructive" })
      setSaving(false)
    }
  }

  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-pitch-600" />
          <p className="text-sm text-stadium-500">Vérification de l&apos;invitation...</p>
        </div>
      </div>
    )
  }

  if (pageState === "expired") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stadium-200 shadow-lg p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-7 w-7 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-stadium-900 mb-2">Invitation expirée</h1>
          <p className="text-sm text-stadium-500 mb-6">
            Cette invitation a expiré. Demandez au joueur de vous renvoyer une nouvelle invitation.
          </p>
          <Button onClick={() => router.push("/login")} className="bg-pitch-600 hover:bg-pitch-700 rounded-xl">
            Aller à la connexion
          </Button>
        </div>
      </div>
    )
  }

  if (pageState === "used") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stadium-200 shadow-lg p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-pitch-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-pitch-600" />
          </div>
          <h1 className="text-xl font-bold text-stadium-900 mb-2">Invitation déjà acceptée</h1>
          <p className="text-sm text-stadium-500 mb-6">
            Cette invitation a déjà été utilisée. Connectez-vous à votre compte.
          </p>
          <Button onClick={() => router.push("/login")} className="bg-pitch-600 hover:bg-pitch-700 rounded-xl">
            Se connecter
          </Button>
        </div>
      </div>
    )
  }

  if (pageState === "error" || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stadium-200 shadow-lg p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-7 w-7 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-stadium-900 mb-2">Invitation invalide</h1>
          <p className="text-sm text-stadium-500 mb-6">{errorMessage || "Lien invalide ou expiré."}</p>
          <Button onClick={() => router.push("/register")} variant="outline" className="rounded-xl">
            Créer un compte
          </Button>
        </div>
      </div>
    )
  }

  const canGoStep2 = form.firstName.length > 0 && form.lastName.length > 0 && form.password.length >= 8 && form.password === form.confirmPassword

  return (
    <div className="min-h-screen bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <FootballIcon className="w-8 h-8 rounded-lg" variant="dark" />
          <span className="text-lg font-bold text-stadium-900 tracking-tight">Profoot Profile</span>
        </div>

        {/* Invitation banner */}
        <div className="bg-pitch-50 border border-pitch-200 rounded-xl px-4 py-3 mb-6 text-center">
          <p className="text-sm text-pitch-700">
            <strong>{invitation.player.name}</strong>
            {invitation.player.club && ` · ${invitation.player.club}`}
            {" "}vous invite à le rejoindre
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6 px-4">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-pitch-600" : "bg-stadium-200"}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-pitch-600" : "bg-stadium-200"}`} />
        </div>

        <div className="bg-white rounded-2xl border border-stadium-200 shadow-lg p-6 sm:p-8">
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-pitch-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-pitch-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-stadium-900">Créez votre compte</h1>
                  <p className="text-xs text-stadium-500">Étape 1/2 · Informations de connexion</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium">Prénom *</Label>
                    <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} className="mt-1 rounded-xl" placeholder="Votre prénom" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium">Nom *</Label>
                    <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} className="mt-1 rounded-xl" placeholder="Votre nom" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <Input value={invitation.agentEmail} disabled className="mt-1 rounded-xl bg-stadium-50 text-stadium-500" />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium">Mot de passe *</Label>
                  <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} className="mt-1 rounded-xl" placeholder="8 caractères minimum" />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer le mot de passe *</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="mt-1 rounded-xl" placeholder="Confirmez votre mot de passe" />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!canGoStep2}
                  className="w-full bg-pitch-600 hover:bg-pitch-700 rounded-xl h-11 font-semibold shadow-sm mt-2"
                >
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-pitch-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-pitch-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-stadium-900">Profil agent</h1>
                  <p className="text-xs text-stadium-500">Étape 2/2 · Informations professionnelles (optionnel)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="agencyName" className="text-sm font-medium flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-stadium-400" /> Agence
                  </Label>
                  <Input id="agencyName" name="agencyName" value={form.agencyName} onChange={handleChange} className="mt-1 rounded-xl" placeholder="Nom de votre agence" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="licenseNumber" className="text-sm font-medium flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-stadium-400" /> N° de licence
                    </Label>
                    <Input id="licenseNumber" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} className="mt-1 rounded-xl" placeholder="FRA-2024-XXX" />
                  </div>
                  <div>
                    <Label htmlFor="licenseCountry" className="text-sm font-medium">Pays licence</Label>
                    <Input id="licenseCountry" name="licenseCountry" value={form.licenseCountry} onChange={handleChange} className="mt-1 rounded-xl" placeholder="France" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-stadium-400" /> Téléphone
                  </Label>
                  <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="mt-1 rounded-xl" placeholder="+33 6 XX XX XX XX" />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                  <Textarea id="bio" name="bio" value={form.bio} onChange={handleChange} className="mt-1 rounded-xl" rows={3} placeholder="Présentez-vous brièvement..." />
                </div>

                <div className="flex gap-3 mt-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl h-11 border-stadium-200">
                    Retour
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-1 bg-pitch-600 hover:bg-pitch-700 rounded-xl h-11 font-semibold shadow-sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Créer mon compte
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-[11px] text-stadium-400 text-center mt-1">
                  Vous pourrez compléter votre profil plus tard depuis votre tableau de bord.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-stadium-400 mt-6">
          En créant un compte, vous acceptez les conditions d&apos;utilisation de Profoot Profile.
        </p>
      </div>
    </div>
  )
}
