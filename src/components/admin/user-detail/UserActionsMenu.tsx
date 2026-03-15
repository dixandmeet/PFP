"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  MoreVertical,
  Ban,
  RotateCcw,
  KeyRound,
  LogOut,
  CheckCircle,
} from "lucide-react"
import type { UserDetail } from "./types"
import { isClubRole } from "@/lib/utils/role-helpers"

interface UserActionsMenuProps {
  user: UserDetail
  onAction: (action: string, data?: any) => Promise<void>
  disabled?: boolean
}

export function UserActionsMenu({ user, onAction, disabled }: UserActionsMenuProps) {
  const [confirmAction, setConfirmAction] = useState<{
    title: string
    description: string
    action: string
    data?: any
  } | null>(null)

  const isSuspended = false

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {!user.emailVerified && (
            <DropdownMenuItem
              onClick={() => onAction("verifyEmail", { verified: true })}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marquer email vérifié
            </DropdownMenuItem>
          )}
          {user.emailVerified && (
            <DropdownMenuItem
              onClick={() => onAction("verifyEmail", { verified: false })}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Retirer vérification email
            </DropdownMenuItem>
          )}
          {user.role === "AGENT" && user.agentProfile && !user.agentProfile.isVerified && (
            <DropdownMenuItem
              onClick={() => onAction("verifyAgent", { verified: true })}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verifier agent
            </DropdownMenuItem>
          )}
          {isClubRole(user.role) && user.clubProfile && !user.clubProfile.isVerified && (
            <DropdownMenuItem
              onClick={() => onAction("verifyClub", { verified: true })}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verifier club
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() =>
              setConfirmAction({
                title: isSuspended ? "Reactiver l'utilisateur ?" : "Suspendre l'utilisateur ?",
                description: isSuspended
                  ? "L'utilisateur pourra a nouveau se connecter et utiliser la plateforme."
                  : "L'utilisateur ne pourra plus se connecter ni interagir avec la plateforme.",
                action: isSuspended ? "reactivate" : "suspend",
              })
            }
          >
            {isSuspended ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reactiver
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Suspendre
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() =>
              setConfirmAction({
                title: "Reinitialiser le mot de passe ?",
                description:
                  "Un email de reinitialisation sera envoye a l'utilisateur.",
                action: "resetPassword",
              })
            }
          >
            <KeyRound className="h-4 w-4 mr-2" />
            Reinitialiser mot de passe
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              setConfirmAction({
                title: "Forcer la deconnexion ?",
                description:
                  "Toutes les sessions actives de l'utilisateur seront invalidees.",
                action: "forceLogout",
              })
            }
          >
            <LogOut className="h-4 w-4 mr-2" />
            Forcer deconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction) {
                  onAction(confirmAction.action, confirmAction.data)
                }
                setConfirmAction(null)
              }}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
