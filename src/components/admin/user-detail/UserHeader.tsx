"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserBadge, StatusBadge } from "@/components/admin/UserBadge"
import { UserActionsMenu } from "./UserActionsMenu"
import { DeleteUserDialog } from "./DeleteUserDialog"
import {
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Pencil,
  Save,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import type { UserDetail } from "./types"

interface UserHeaderProps {
  user: UserDetail
  displayName: string
  isEditing: boolean
  isSaving: boolean
  dirty: boolean
  isValid: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onAction: (action: string, data?: any) => Promise<void>
  onDelete: () => Promise<void>
}

export function UserHeader({
  user,
  displayName,
  isEditing,
  isSaving,
  dirty,
  isValid,
  onEdit,
  onSave,
  onCancel,
  onAction,
  onDelete,
}: UserHeaderProps) {
  return (
    <div className="sticky top-14 z-20 bg-white border-b border-slate-200">
      <div className="p-4 lg:p-6">
        {dirty && !isSaving && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Modifications non enregistrees. Pensez a sauvegarder.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-slate-100">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="text-lg bg-slate-100 font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-slate-900">
                  {displayName}
                </h2>
                <UserBadge role={user.role} />
                {(user.agentProfile?.isVerified || user.clubProfile?.isVerified) && (
                  <StatusBadge status="verified" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Inscrit{" "}
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  {user.emailVerified ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-600">Email vérifié</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-amber-600">Email non vérifié</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={onSave}
                  disabled={!dirty || !isValid || isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1.5" />
                  )}
                  Enregistrer
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-1.5" />
                Modifier
              </Button>
            )}

            <UserActionsMenu
              user={user}
              onAction={onAction}
              disabled={isSaving}
            />

            <DeleteUserDialog
              userName={displayName}
              onConfirm={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
