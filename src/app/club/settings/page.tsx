"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { passwordSchema as passwordValidator } from "@/lib/validators/schemas"
import { motion } from "framer-motion"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, Trash2, AlertTriangle, Mail, Lock, ShieldAlert } from "lucide-react"
import { signOut } from "next-auth/react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Settings } from "lucide-react"

const emailSchema = z.object({
  email: z.string().email("Email invalide"),
})
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: passwordValidator,
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type EmailFormData = z.infer<typeof emailSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function ClubSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const emailForm = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) })
  const passwordForm = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch("/api/users/me")
        if (!r.ok) throw new Error()
        const d = await r.json()
        emailForm.setValue("email", d.email)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const onSubmitEmail = async (data: EmailFormData) => {
    setSaving(true)
    try {
      const r = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!r.ok) {
        const err = await r.json()
        throw new Error(err.error || "Erreur")
      }
      toast({ title: "Succès", description: "Email mis à jour" })
    } catch (e: unknown) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const onSubmitPassword = async (data: PasswordFormData) => {
    setSaving(true)
    try {
      const r = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })
      if (!r.ok) {
        const err = await r.json()
        throw new Error(err.error || "Erreur")
      }
      toast({ title: "Succès", description: "Mot de passe mis à jour" })
      passwordForm.reset()
    } catch (e: unknown) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const r = await fetch("/api/users/me", { method: "DELETE" })
      if (!r.ok) throw new Error("Erreur")
      toast({ title: "Compte supprimé", description: "Votre compte a été supprimé avec succès" })
      await signOut({ callbackUrl: "/" })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-pitch-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <PageHeader
        title="Paramètres"
        subtitle="Gérez l&apos;email, le mot de passe et les options du compte"
        icon={Settings}
        variant="compact"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Email */}
        <motion.div variants={item}>
          <Card hover={false} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pitch-100 text-pitch-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Adresse email</CardTitle>
                  <CardDescription>Votre email de connexion pour le compte club</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    className="max-w-md"
                    {...emailForm.register("email")}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-red-600">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={saving} className="bg-pitch-600 hover:bg-pitch-700">
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Enregistrer
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mot de passe */}
        <motion.div variants={item}>
          <Card hover={false} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pitch-100 text-pitch-600">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Mot de passe</CardTitle>
                  <CardDescription>Modifiez votre mot de passe de connexion</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    className="max-w-md"
                    {...passwordForm.register("currentPassword")}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-600">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="max-w-md"
                    {...passwordForm.register("newPassword")}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-600">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="max-w-md"
                    {...passwordForm.register("confirmPassword")}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={saving} className="bg-pitch-600 hover:bg-pitch-700">
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Changer le mot de passe
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Zone danger */}
        <motion.div variants={item}>
          <Card
            hover={false}
            className="overflow-hidden border-red-200 bg-red-50/50 dark:bg-red-950/20"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/50">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-red-900 dark:text-red-100">
                    Zone de danger
                  </CardTitle>
                  <CardDescription className="text-red-700 dark:text-red-300">
                    Actions irréversibles
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">
                    Supprimer le compte
                  </p>
                  <p className="text-sm text-red-700/90 dark:text-red-300/90">
                    Supprime définitivement le compte club et toutes les données associées
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="shrink-0"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
              <AlertTriangle className="h-5 w-5" />
              Supprimer le compte ?
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes les données du compte club seront
              définitivement supprimées.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              Seront supprimés :
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700 dark:text-red-300">
              <li>Le profil club</li>
              <li>Les équipes et le staff</li>
              <li>Les annonces et candidatures</li>
              <li>Tous les fichiers associés</li>
            </ul>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
