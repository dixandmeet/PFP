"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

interface DeleteUserDialogProps {
  userName: string
  onConfirm: () => Promise<void>
}

export function DeleteUserDialog({ userName, onConfirm }: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const isConfirmed = confirmText.trim().toLowerCase() === userName.trim().toLowerCase()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
      setOpen(false)
      setConfirmText("")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirmText("") }}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irreversible. Toutes les donnees de{" "}
            <strong>{userName}</strong> seront definitivement supprimees.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-3">
          <Label htmlFor="confirm-name" className="text-sm font-medium">
            Tapez <strong>{userName}</strong> pour confirmer
          </Label>
          <Input
            id="confirm-name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={userName}
            className="mt-2"
            autoComplete="off"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer definitivement"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
