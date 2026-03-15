"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { passwordSchema as passwordValidator } from "@/lib/validators/schemas"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, Trash2, AlertTriangle } from "lucide-react"
import { signOut } from "next-auth/react"

const emailSchema = z.object({
  email: z.string().email("Email invalide"),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: passwordValidator,
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type EmailFormData = z.infer<typeof emailSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function PlayerSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentEmail, setCurrentEmail] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Charger les infos utilisateur
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/users/me")
        if (!response.ok) throw new Error("Erreur")

        const data = await response.json()
        setCurrentEmail(data.email)
        emailForm.setValue("email", data.email)
      } catch (error) {
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
    setSaving(true)
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      setCurrentEmail(data.email)
      toast({
        title: "Succès",
        description: "Email mis à jour",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const onSubmitPassword = async (data: PasswordFormData) => {
    setSaving(true)
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
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      toast({
        title: "Succès",
        description: "Mot de passe mis à jour",
      })

      passwordForm.reset()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/users/me", {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erreur")

      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès",
      })

      // Déconnexion
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-gray-600 mt-1">
          Gérez votre compte et préférences
        </p>
      </div>

      <div className="space-y-6">
        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse email</CardTitle>
            <CardDescription>
              Votre email de connexion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={saving}>
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
            </form>
          </CardContent>
        </Card>

        {/* Mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle>Mot de passe</CardTitle>
            <CardDescription>
              Modifiez votre mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register("currentPassword")}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register("newPassword")}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Changer le mot de passe
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Confidentialité */}
        <Card>
          <CardHeader>
            <CardTitle>Confidentialité</CardTitle>
            <CardDescription>
              Gérez la visibilité de votre profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profil public</p>
                  <p className="text-sm text-gray-600">
                    Votre profil est visible par tous
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configurer
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Visible dans les recherches</p>
                  <p className="text-sm text-gray-600">
                    Les clubs peuvent vous trouver
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configurer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone danger */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">Zone de danger</CardTitle>
            <CardDescription className="text-red-700">
              Actions irréversibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Supprimer mon compte</p>
                <p className="text-sm text-gray-600">
                  Supprime définitivement votre compte et toutes vos données
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog confirmation suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Supprimer votre compte ?
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos données seront
              définitivement supprimées.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-900 font-medium">
              Seront supprimés :
            </p>
            <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
              <li>Votre profil joueur</li>
              <li>Vos candidatures</li>
              <li>Vos mandats</li>
              <li>Vos posts et commentaires</li>
              <li>Tous vos fichiers</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="mr-2 h-4 w-4" />
              Confirmer la suppression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
