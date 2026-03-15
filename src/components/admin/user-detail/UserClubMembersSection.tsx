"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  UserPlus,
  Loader2,
  AlertCircle,
  Crown,
  Shield,
  User,
  Eye,
  ExternalLink,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import type { ClubMemberEntry } from "./types"

interface UserClubMembersSectionProps {
  clubProfileId: string
}

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  OWNER: { label: "Propriétaire", icon: Crown, color: "bg-amber-100 text-amber-800" },
  ADMIN: { label: "Administrateur", icon: Shield, color: "bg-blue-100 text-blue-800" },
  STAFF: { label: "Staff", icon: User, color: "bg-green-100 text-green-800" },
  VIEWER: { label: "Observateur", icon: Eye, color: "bg-gray-100 text-gray-800" },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Actif", color: "bg-green-100 text-green-700" },
  INVITED: { label: "Invité", color: "bg-amber-100 text-amber-700" },
  REMOVED: { label: "Retiré", color: "bg-red-100 text-red-700" },
}

const ONBOARDING_CONFIG: Record<string, { label: string; color: string }> = {
  PROFILE: { label: "Profil en cours", color: "bg-blue-100 text-blue-700" },
  KYC: { label: "KYC en cours", color: "bg-purple-100 text-purple-700" },
  DONE: { label: "Terminé", color: "bg-green-100 text-green-700" },
}

export function UserClubMembersSection({ clubProfileId }: UserClubMembersSectionProps) {
  const [members, setMembers] = useState<ClubMemberEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>("STAFF")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState("")

  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    try {
      setError("")
      const res = await fetch(`/api/admin/clubs/${clubProfileId}/members`)
      if (!res.ok) throw new Error("Erreur de chargement")
      const data = await res.json()
      setMembers(data.members)
    } catch {
      setError("Impossible de charger les membres")
    } finally {
      setLoading(false)
    }
  }, [clubProfileId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleInvite = async () => {
    setInviteError("")
    if (!inviteEmail.trim()) {
      setInviteError("L'email est requis")
      return
    }

    setInviting(true)
    try {
      const res = await fetch(`/api/admin/clubs/${clubProfileId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur lors de l'invitation")
      }

      setInviteEmail("")
      setInviteRole("STAFF")
      setInviteOpen(false)
      fetchMembers()
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Erreur inattendue")
    } finally {
      setInviting(false)
    }
  }

  const handleChangeRole = async (memberId: string, newRole: string) => {
    setActionLoading(memberId)
    try {
      const res = await fetch(`/api/admin/clubs/${clubProfileId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur")
      }

      fetchMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer ce membre ?")) return

    setActionLoading(memberId)
    try {
      const res = await fetch(`/api/admin/clubs/${clubProfileId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur")
      }

      fetchMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-pitch-500" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-pitch-600" />
          <h3 className="font-semibold text-pitch-900">Membres du club</h3>
          <Badge variant="secondary" className="text-xs">
            {members.length}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={fetchMembers}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <UserPlus className="w-4 h-4 mr-1" />
                Inviter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inviter un membre</DialogTitle>
                <DialogDescription>
                  Envoyez une invitation par email pour rejoindre le club.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="membre@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="VIEWER">Observateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {inviteError && (
                  <p className="text-sm text-red-500">{inviteError}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setInviteOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleInvite} disabled={inviting}>
                  {inviting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                  Envoyer l'invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {members.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Aucun membre</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {members.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.STAFF
            const statusConfig = STATUS_CONFIG[member.status] || STATUS_CONFIG.ACTIVE
            const RoleIcon = roleConfig.icon
            const isLoading = actionLoading === member.id

            return (
              <div
                key={member.id}
                className="flex items-center justify-between py-3 gap-4"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-pitch-100 flex items-center justify-center shrink-0">
                    {member.user?.image ? (
                      <img
                        src={member.user.image}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-pitch-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {member.user ? (
                        <Link
                          href={`/admin/users/${member.user.id}`}
                          className="text-sm font-medium text-pitch-900 hover:text-pitch-600 hover:underline truncate"
                        >
                          {member.user.name || member.email}
                          <ExternalLink className="w-3 h-3 inline ml-1 opacity-50" />
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-gray-600 truncate">
                          {member.email}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={`text-[10px] px-1.5 py-0 ${roleConfig.color}`}>
                        <RoleIcon className="w-3 h-3 mr-0.5" />
                        {roleConfig.label}
                      </Badge>
                      <Badge className={`text-[10px] px-1.5 py-0 ${statusConfig.color}`}>
                        {statusConfig.label}
                      </Badge>
                      {member.staffOnboardingStep && member.staffOnboardingStep !== "DONE" && (
                        <Badge className={`text-[10px] px-1.5 py-0 ${ONBOARDING_CONFIG[member.staffOnboardingStep]?.color || "bg-gray-100 text-gray-700"}`}>
                          {ONBOARDING_CONFIG[member.staffOnboardingStep]?.label || member.staffOnboardingStep}
                        </Badge>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {format(new Date(member.createdAt), "dd MMM yyyy", { locale: fr })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {member.role !== "OWNER" && member.status !== "REMOVED" && (
                  <div className="flex items-center gap-1 shrink-0">
                    {member.status === "ACTIVE" && (
                      <Select
                        value={member.role}
                        onValueChange={(val) => handleChangeRole(member.id, val)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-7 text-xs w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Administrateur</SelectItem>
                          <SelectItem value="STAFF">Staff</SelectItem>
                          <SelectItem value="VIEWER">Observateur</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(member.id)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
