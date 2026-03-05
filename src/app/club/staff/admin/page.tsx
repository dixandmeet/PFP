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
  DialogFooter,
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
    label: "Proprietaire",
    icon: Crown,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ADMIN: {
    label: "Administrateur",
    icon: ShieldCheck,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  STAFF: {
    label: "Staff",
    icon: Shield,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  VIEWER: {
    label: "Observateur",
    icon: Eye,
    className: "bg-gray-50 text-gray-600 border-gray-200",
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
        toast({ title: "Invitation envoyee", description: `Invitation envoyee a ${data.email}` })
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
        toast({ title: "Role modifie", description: "Le role a ete mis a jour" })
        loadData()
      } catch (err: unknown) {
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Impossible de modifier le role",
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
        toast({
          title: "Invitation renvoyée",
          description: "Un nouvel email d'invitation a été envoyé.",
        })
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
      toast({ title: "Membre retire", description: "Le membre a ete retire du club" })
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
      toast({ title: "Propriete transferee", description: `${transferTarget.user?.name || transferTarget.email} est maintenant proprietaire` })
      setTransferTarget(null)
      loadData()
    } catch (err: unknown) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de transferer la propriete",
        variant: "destructive",
      })
    } finally {
      setTransferring(false)
    }
  }, [transferTarget, toast, loadData])

  // ─── Error state ───────────────────────────────────────────────────────

  if (error && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-gray-200 bg-white">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Erreur de chargement</h2>
          <p className="text-sm text-gray-500 mb-6">{errorMessage ?? "Impossible de charger les membres."}</p>
          <Button onClick={loadData} className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2">
            <RefreshCw className="w-4 h-4" />
            Reessayer
          </Button>
        </div>
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
          <p className="text-gray-500 mt-1">
            Gerez les membres administrateurs de votre club.
          </p>
        </div>
        {!loading && canInvite && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                form.reset({ email: "", role: "ADMIN" })
                setInviteDialogOpen(true)
              }}
              className="rounded-xl gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            >
              <ShieldCheck className="w-4 h-4" />
              Inviter en tant qu'admin
            </Button>
            <Button
              onClick={() => {
                form.reset({ email: "", role: "STAFF" })
                setInviteDialogOpen(true)
              }}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Inviter un membre
            </Button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-6 bg-gray-100 rounded-full w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{activeMembers.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">Membres actifs</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activeMembers.filter((m) => m.role === "ADMIN").length}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Admins</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{invitedMembers.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">En attente</div>
            </div>
          </div>

          {/* Active members list */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Membres actifs ({activeMembers.length})
            </h2>
            {activeMembers.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500">Aucun membre actif.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeMembers.map((member) => {
                  const roleInfo = ROLE_CONFIG[member.role]
                  const RoleIcon = roleInfo.icon
                  return (
                    <div
                      key={member.id}
                      className="group rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                          {member.user?.image ? (
                            <img
                              src={member.user.image}
                              alt={member.user.name || ""}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate text-sm">
                            {member.user?.name || member.email}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {member.email}
                          </div>
                        </div>

                        {/* Role badge or select */}
                        {isOwner && member.role !== "OWNER" ? (
                          <Select
                            value={member.role}
                            onValueChange={(v) => handleChangeRole(member.id, v)}
                          >
                            <SelectTrigger className="w-[150px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">
                                <span className="flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                  Administrateur
                                </span>
                              </SelectItem>
                              <SelectItem value="STAFF">
                                <span className="flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5 text-green-600" />
                                  Staff
                                </span>
                              </SelectItem>
                              <SelectItem value="VIEWER">
                                <span className="flex items-center gap-1.5">
                                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                                  Observateur
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleInfo.className}`}
                          >
                            <RoleIcon className="w-3.5 h-3.5" />
                            {roleInfo.label}
                          </span>
                        )}

                        {/* Actions */}
                        {isOwner && member.role !== "OWNER" && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => setTransferTarget(member)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Transferer la propriete"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setRemoveTarget(member)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Retirer ce membre"
                            >
                              <Trash2 className="w-4 h-4" />
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
              <h2 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Invitations en attente ({invitedMembers.length})
              </h2>
              <div className="space-y-2">
                {invitedMembers.map((invite) => {
                  const roleInfo = ROLE_CONFIG[invite.role]
                  return (
                    <div
                      key={invite.id}
                      className="group rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-700 truncate text-sm">
                            {invite.email}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3" />
                            Invite le {formatDate(invite.createdAt)}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${roleInfo.className}`}
                        >
                          {roleInfo.label}
                        </span>
                        {canInvite && (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => handleResendInvite(invite.id)}
                              disabled={resendingId === invite.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 disabled:opacity-50"
                              title="Renvoyer l'invitation"
                            >
                              {resendingId === invite.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setRemoveTarget(invite)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                              title="Annuler l'invitation"
                            >
                              <X className="w-4 h-4" />
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

          {/* Empty state: no members at all except owner */}
          {activeMembers.length <= 1 && invitedMembers.length === 0 && canInvite && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Ajoutez des membres a votre equipe
              </h3>
              <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                Invitez des administrateurs, staff ou observateurs pour gerer votre club ensemble.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    form.reset({ email: "", role: "ADMIN" })
                    setInviteDialogOpen(true)
                  }}
                  className="rounded-xl gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Inviter un admin
                </Button>
                <Button
                  onClick={() => {
                    form.reset({ email: "", role: "STAFF" })
                    setInviteDialogOpen(true)
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Inviter un membre
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Invite Dialog ──────────────────────────────────────────────── */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {form.watch("role") === "ADMIN" ? "Inviter un administrateur" : "Inviter un membre"}
            </DialogTitle>
            <DialogDescription>
              {form.watch("role") === "ADMIN"
                ? "Envoyez une invitation par email pour ajouter un administrateur (gestion des membres et invitations)."
                : "Envoyez une invitation par email pour ajouter un membre au club."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleInvite)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="nom@exemple.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(v) => form.setValue("role", v as "ADMIN" | "STAFF" | "VIEWER")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Administrateur — Peut gerer les membres et invitations
                    </span>
                  </SelectItem>
                  <SelectItem value="STAFF">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      Staff — Acces operationnel
                    </span>
                  </SelectItem>
                  <SelectItem value="VIEWER">
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      Observateur — Acces en lecture seule
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <UserPlus className="w-4 h-4" />
                Envoyer l'invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Remove Member / Cancel Invitation Dialog ───────────────────── */}
      <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {removeTarget?.status === "INVITED" ? "Annuler cette invitation ?" : "Retirer ce membre ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget && removeTarget.status === "INVITED" ? (
                <>
                  L'invitation envoyee a <strong>{removeTarget.email}</strong> sera annulee.
                </>
              ) : removeTarget ? (
                <>
                  <strong>{removeTarget.user?.name || removeTarget.email}</strong> sera
                  retire du club.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removing}
              className="bg-red-500 hover:bg-red-600"
            >
              {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : removeTarget?.status === "INVITED" ? "Annuler l'invitation" : "Retirer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Transfer Ownership Dialog ──────────────────────────────────── */}
      <AlertDialog open={!!transferTarget} onOpenChange={() => setTransferTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transferer la propriete ?</AlertDialogTitle>
            <AlertDialogDescription>
              {transferTarget && (
                <>
                  <strong>{transferTarget.user?.name || transferTarget.email}</strong> deviendra le
                  proprietaire du club. Vous deviendrez administrateur.
                  <br />
                  <span className="text-amber-600 font-medium">
                    Cette action est irreversible sauf si le nouveau proprietaire vous retransfere la propriete.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransfer}
              disabled={transferring}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {transferring ? <Loader2 className="w-4 h-4 animate-spin" /> : "Transferer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
