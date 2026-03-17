"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { passwordSchema as passwordValidator } from "@/lib/validators/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Mail,
  Lock,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"

const emailSchema = z.object({
  email: z.string().email("Email invalide"),
})

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: passwordValidator,
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type EmailFormData = z.infer<typeof emailSchema>
type PasswordFormData = z.infer<typeof passwordFormSchema>

export default function AgentSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
  })

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/users/me")
        if (!response.ok) throw new Error("Erreur")
        const data = await response.json()
        emailForm.setValue("email", data.email)
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [toast])

  const onSubmitEmail = async (data: EmailFormData) => {
    setSavingEmail(true)
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Erreur")
      }
      toast({ title: "Email mis à jour" })
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    } finally {
      setSavingEmail(false)
    }
  }

  const onSubmitPassword = async (data: PasswordFormData) => {
    setSavingPassword(true)
    try {
      const response = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Erreur")
      }
      toast({ title: "Mot de passe mis à jour" })
      passwordForm.reset()
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <div className="h-7 bg-slate-200 rounded-lg w-36 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-48 animate-pulse" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white ring-1 ring-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Paramètres</h1>
        <p className="text-sm text-slate-500 mt-1">Gérez votre compte et vos préférences</p>
      </div>

      {/* Email section */}
      <div className="bg-white ring-1 ring-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Adresse email</h2>
              <p className="text-xs text-slate-500">Votre email de connexion</p>
            </div>
          </div>
        </div>
        <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="px-5 py-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-xs font-medium text-slate-600 mb-1.5 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...emailForm.register("email")}
                className="border-slate-200 focus:ring-2 focus:ring-green-600/30"
              />
              {emailForm.formState.errors.email && (
                <p className="text-xs text-red-600 mt-1">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={savingEmail}
                size="sm"
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                {savingEmail ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Password section */}
      <div className="bg-white ring-1 ring-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Lock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Mot de passe</h2>
              <p className="text-xs text-slate-500">Modifiez votre mot de passe</p>
            </div>
          </div>
        </div>
        <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="px-5 py-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="currentPassword" className="text-xs font-medium text-slate-600 mb-1.5 block">
                Mot de passe actuel
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  {...passwordForm.register("currentPassword")}
                  className="border-slate-200 focus:ring-2 focus:ring-green-600/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-red-600 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-xs font-medium text-slate-600 mb-1.5 block">
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...passwordForm.register("newPassword")}
                  className="border-slate-200 focus:ring-2 focus:ring-green-600/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-red-600 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-600 mb-1.5 block">
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register("confirmPassword")}
                className="border-slate-200 focus:ring-2 focus:ring-green-600/30"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={savingPassword}
                size="sm"
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                {savingPassword ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Changer le mot de passe"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Logout */}
      <div className="bg-white ring-1 ring-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <LogOut className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Déconnexion</h2>
              <p className="text-xs text-slate-500">Se déconnecter de votre compte</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Se déconnecter
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white ring-1 ring-red-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-red-900">Supprimer le compte</h2>
              <p className="text-xs text-red-500">Action irréversible</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            Supprimer
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm ring-1 ring-slate-200 rounded-2xl">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-slate-900">
              Supprimer votre compte ?
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-500">
              Cette action est irréversible. Toutes vos données seront supprimées définitivement.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 rounded-xl border-slate-200 text-slate-600"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex-1 rounded-xl"
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
