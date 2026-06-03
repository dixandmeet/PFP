"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  UserPlus,
  Shield,
  ShieldCheck,
  Crown,
  Trash2,
  AlertCircle,
  RefreshCw,
  Mail,
  Clock,
  X,
  User,
  Users,
  Eye,
  ArrowRightLeft,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface MemberUser {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface ClubMember {
  id: string
  userId: string | null
  email: string
  role: "OWNER" | "ADMIN" | "STAFF" | "VIEWER"
  status: "ACTIVE" | "INVITED" | "REMOVED"
  user: MemberUser | null
  createdAt: string
  acceptedAt: string | null
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]),
})

type InviteFormData = z.infer<typeof inviteSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  OWNER: {
    label: "Propriétaire",
    icon: Crown,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "ring-amber-200",
  },
  ADMIN: {
    label: "Administrateur",
    icon: ShieldCheck,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "ring-blue-200",
  },
  STAFF: {
    label: "Staff",
    icon: Shield,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "ring-green-200",
  },
  VIEWER: {
    label: "Observateur",
    icon: Eye,
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "ring-slate-200",
  },
} as const

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ClubAdminPage() {
  const { toast } = useToast()
  const [members, setMembers] = useState<ClubMember[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [removeTarget, setRemoveTarget] = useState<ClubMember | null>(null)
  const [removing, setRemoving] = useState(false)

  const [resendingId, setResendingId] = useState<string | null>(null)

  const [transferTarget, setTransferTarget] = useState<ClubMember | null>(null)
  const [transferring, setTransferring] = useState(false)

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "STAFF" },
  })

  // ─── Derived ───────────────────────────────────────────────────────────

  const activeMembers = members.filter((m) => m.status === "ACTIVE")
  const invitedMembers = members.filter((m) => m.status === "INVITED")

  const isOwner = currentUserRole === "OWNER"
  const canInvite = currentUserRole === "OWNER" || currentUserRole === "ADMIN"

  // ─── Load data ─────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setError(false)
    setErrorMessage(null)
    setLoading(true)
    try {
      const res = await fetch("/api/club/members")
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMessage(typeof data?.error === "string" ? data.error : "Impossible de charger les membres.")
        setError(true)
        return
      }
      setMembers(data.members || [])
      setCurrentUserRole(data.currentUserRole || null)
    } catch {
      setErrorMessage("Impossible de charger les membres.")
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ─── Invite ────────────────────────────────────────────────────────────

  const handleInvite = useCallback(
    async (data: InviteFormData) => {
      setSaving(true)
      try {
        const res = await fetch("/api/club/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Erreur")
        }
        toast({ title: "Invitation envoyée", description: `Invitation envoyée à ${data.email}` })
        form.reset()
        setInviteDialogOpen(false)
        loadData()
      } catch (err: unknown) {
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Impossible d'envoyer l'invitation",
          variant: "destructive",
        })
      } finally {
        setSaving(false)
      }
    },
    [form, toast, loadData]
  )

  // ─── Change role ───────────────────────────────────────────────────────

  const handleChangeRole = useCallback(
    async (memberId: string, newRole: string) => {
      try {
        const res = await fetch("/api/club/members", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId, role: newRole }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Erreur")
        }
        toast({ title: "Rôle modifié" })
        loadData()
      } catch (err: unknown) {
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Impossible de modifier le rôle",
          variant: "destructive",
        })
      }
    },
    [toast, loadData]
  )

  // ─── Resend invitation ────────────────────────────────────────────────

  const handleResendInvite = useCallback(
    async (memberId: string) => {
      setResendingId(memberId)
      try {
        const res = await fetch("/api/club/members/resend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Erreur")
        }
        toast({ title: "Invitation renvoyée" })
        loadData()
      } catch (err: unknown) {
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Impossible de renvoyer l'invitation",
          variant: "destructive",
        })
      } finally {
        setResendingId(null)
      }
    },
    [toast, loadData]
  )

  // ─── Remove member ────────────────────────────────────────────────────

  const handleRemove = useCallback(async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      const res = await fetch("/api/club/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: removeTarget.id }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erreur")
      }
      toast({ title: "Membre retiré" })
      setRemoveTarget(null)
      loadData()
    } catch (err: unknown) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de retirer le membre",
        variant: "destructive",
      })
    } finally {
      setRemoving(false)
    }
  }, [removeTarget, toast, loadData])

  // ─── Transfer ownership ───────────────────────────────────────────────

  const handleTransfer = useCallback(async () => {
    if (!transferTarget) return
    setTransferring(true)
    try {
      const res = await fetch("/api/club/members/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toMemberId: transferTarget.id }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erreur")
      }
      toast({
        title: "Propriété transférée",
        description: `${transferTarget.user?.name || transferTarget.email} est maintenant propriétaire`,
      })
      setTransferTarget(null)
      loadData()
    } catch (err: unknown) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de transférer la propriété",
        variant: "destructive",
      })
    } finally {
      setTransferring(false)
    }
  }, [transferTarget, toast, loadData])

  // ─── Error state ───────────────────────────────────────────────────────

  if (error && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white ring-1 ring-red-200 rounded-xl p-8 text-center">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">Erreur de chargement</p>
          <p className="text-xs text-slate-500 mb-4">{errorMessage ?? "Impossible de charger les membres."}</p>
          <Button
            onClick={loadData}
            size="sm"
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Administration</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les membres de votre club
          </p>
        </div>
        {!loading && canInvite && (
          <Button
            onClick={() => {
              form.reset({ email: "", role: "STAFF" })
              setInviteDialogOpen(true)
            }}
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm self-start sm:self-auto"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            Inviter un membre
          </Button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white ring-1 ring-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="bg-white ring-1 ring-slate-200 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
                <div className="h-6 bg-slate-100 rounded-full w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Membres</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeMembers.length}</p>
            </div>
            <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Admins</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {activeMembers.filter((m) => m.role === "ADMIN").length}
              </p>
            </div>
            <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">En attente</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{invitedMembers.length}</p>
            </div>
          </div>

          {/* Active members list */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              Membres actifs ({activeMembers.length})
            </h2>
            {activeMembers.length === 0 ? (
              <div className="bg-white ring-1 ring-slate-200 rounded-xl p-8 text-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">Aucun membre actif</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeMembers.map((member) => {
                  const roleInfo = ROLE_CONFIG[member.role]
                  const RoleIcon = roleInfo.icon
                  const initials = member.user?.name
                    ? member.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    : member.email.charAt(0).toUpperCase()

                  return (
                    <div
                      key={member.id}
                      className="group bg-white ring-1 ring-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {member.user?.image ? (
                            <img
                              src={member.user.image}
                              alt={member.user.name || ""}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-600">{initials}</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {member.user?.name || member.email}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{member.email}</p>
                        </div>

                        {/* Role badge or select */}
                        {isOwner && member.role !== "OWNER" ? (
                          <Select
                            value={member.role}
                            onValueChange={(v) => handleChangeRole(member.id, v)}
                          >
                            <SelectTrigger className="w-[140px] h-8 text-xs border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">
                                <span className="flex items-center gap-1.5">
                                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                                  Administrateur
                                </span>
                              </SelectItem>
                              <SelectItem value="STAFF">
                                <span className="flex items-center gap-1.5">
                                  <Shield className="h-3.5 w-3.5 text-green-600" />
                                  Staff
                                </span>
                              </SelectItem>
                              <SelectItem value="VIEWER">
                                <span className="flex items-center gap-1.5">
                                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                                  Observateur
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ring-1 ${roleInfo.bg} ${roleInfo.text} ${roleInfo.border}`}
                          >
                            <RoleIcon className="h-3.5 w-3.5" />
                            {roleInfo.label}
                          </span>
                        )}

                        {/* Actions */}
                        {isOwner && member.role !== "OWNER" && (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => setTransferTarget(member)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Transférer la propriété"
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setRemoveTarget(member)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Retirer ce membre"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Pending invitations */}
          {invitedMembers.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                Invitations en attente ({invitedMembers.length})
              </h2>
              <div className="space-y-2">
                {invitedMembers.map((invite) => {
                  const roleInfo = ROLE_CONFIG[invite.role]
                  return (
                    <div
                      key={invite.id}
                      className="group bg-slate-50/50 ring-1 ring-dashed ring-slate-200 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                          <Mail className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {invite.email}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-3 w-3" />
                            Invité le {formatDate(invite.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium ring-1 ${roleInfo.bg} ${roleInfo.text} ${roleInfo.border}`}
                        >
                          {roleInfo.label}
                        </span>
                        {canInvite && (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => handleResendInvite(invite.id)}
                              disabled={resendingId === invite.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 disabled:opacity-50"
                              title="Renvoyer l'invitation"
                            >
                              {resendingId === invite.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setRemoveTarget(invite)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                              title="Annuler l'invitation"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty state: no members besides owner */}
          {activeMembers.length <= 1 && invitedMembers.length === 0 && canInvite && (
            <div className="bg-white ring-1 ring-slate-200 rounded-xl p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                Ajoutez des membres à votre équipe
              </p>
              <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto">
                Invitez des administrateurs, staff ou observateurs pour gérer votre club ensemble.
              </p>
              <Button
                onClick={() => {
                  form.reset({ email: "", role: "STAFF" })
                  setInviteDialogOpen(true)
                }}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                Inviter un membre
              </Button>
            </div>
          )}
        </>
      )}

      {/* ─── Invite Dialog ──────────────────────────────────────────────── */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-md ring-1 ring-slate-200 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Inviter un membre
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Envoyez une invitation par email pour ajouter un membre au club.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleInvite)} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Email *</Label>
              <Input
                type="email"
                placeholder="nom@exemple.com"
                {...form.register("email")}
                className="border-slate-200 focus:ring-2 focus:ring-green-600/30"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Rôle *</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(v) => form.setValue("role", v as "ADMIN" | "STAFF" | "VIEWER")}
              >
                <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-green-600/30">
                  <SelectValue placeholder="Choisir un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                      Administrateur — Gestion des membres
                    </span>
                  </SelectItem>
                  <SelectItem value="STAFF">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      Staff — Accès opérationnel
                    </span>
                  </SelectItem>
                  <SelectItem value="VIEWER">
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-slate-500" />
                      Observateur — Lecture seule
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
                className="rounded-xl border-slate-200 text-slate-600"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    Envoyer l&apos;invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Remove Member / Cancel Invitation Dialog ───────────────────── */}
      <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <AlertDialogContent className="ring-1 ring-slate-200 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              {removeTarget?.status === "INVITED" ? "Annuler cette invitation ?" : "Retirer ce membre ?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              {removeTarget && removeTarget.status === "INVITED" ? (
                <>
                  L&apos;invitation envoyée à <strong className="text-slate-700">{removeTarget.email}</strong> sera annulée.
                </>
              ) : removeTarget ? (
                <>
                  <strong className="text-slate-700">{removeTarget.user?.name || removeTarget.email}</strong> sera
                  retiré du club.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removing}
              className="rounded-xl bg-red-500 hover:bg-red-600"
            >
              {removing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : removeTarget?.status === "INVITED" ? (
                "Annuler l'invitation"
              ) : (
                "Retirer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Transfer Ownership Dialog ──────────────────────────────────── */}
      <AlertDialog open={!!transferTarget} onOpenChange={() => setTransferTarget(null)}>
        <AlertDialogContent className="ring-1 ring-slate-200 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Transférer la propriété ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              {transferTarget && (
                <>
                  <strong className="text-slate-700">{transferTarget.user?.name || transferTarget.email}</strong> deviendra le
                  propriétaire du club. Vous deviendrez administrateur.
                  <br />
                  <span className="text-amber-600 font-medium text-xs mt-2 block">
                    Cette action est irréversible sauf si le nouveau propriétaire vous retransfère la propriété.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransfer}
              disabled={transferring}
              className="rounded-xl bg-amber-500 hover:bg-amber-600"
            >
              {transferring ? <Loader2 className="h-4 w-4 animate-spin" /> : "Transférer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
