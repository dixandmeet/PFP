"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Building2,
  Clock,
  Loader2,
  Mail,
  ArrowLeft,
  Link2,
} from "lucide-react"

export interface PendingInvite {
  memberId: string
  token: string
  clubName: string
  role: string
}

interface StaffStep3InviteWaitProps {
  pendingInvites: PendingInvite[]
  onBack: () => void
}

function extractInviteToken(input: string): string {
  const trimmed = input.trim()
  const inviteMatch = trimmed.match(/\/invite\/([^/?#]+)/i)
  if (inviteMatch) return inviteMatch[1]
  return trimmed
}

export function StaffStep3InviteWait({
  pendingInvites,
  onBack,
}: StaffStep3InviteWaitProps) {
  const router = useRouter()
  const [inviteInput, setInviteInput] = useState("")
  const [acceptingToken, setAcceptingToken] = useState<string | null>(null)
  const [error, setError] = useState("")

  const acceptInvite = async (rawToken: string) => {
    setError("")
    setAcceptingToken(rawToken)
    try {
      const res = await fetch("/api/club/staff-onboarding/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: extractInviteToken(rawToken) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Impossible d'accepter l'invitation")
      }
      if (data.step === "DONE") {
        router.push("/club/dashboard")
      } else {
        router.push("/club/staff-onboarding")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue")
    } finally {
      setAcceptingToken(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pitch-100 mb-4">
          <Building2 className="w-7 h-7 text-pitch-600" />
        </div>
        <h2 className="text-xl font-bold text-pitch-900">Rejoindre un club</h2>
        <p className="text-sm text-pitch-600 mt-1 max-w-md mx-auto">
          Votre profil est prêt. Acceptez une invitation ou attendez que
          l&apos;administrateur du club vous invite par e-mail.
        </p>
      </div>

      {pendingInvites.length > 0 && (
        <div className="space-y-3 max-w-lg mx-auto">
          <p className="text-sm font-medium text-pitch-800 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Invitations en attente
          </p>
          {pendingInvites.map((invite) => (
            <div
              key={invite.memberId}
              className="flex items-center justify-between gap-3 p-4 rounded-xl border border-pitch-200 bg-pitch-50/50"
            >
              <div>
                <p className="font-semibold text-pitch-900">{invite.clubName}</p>
                <p className="text-xs text-pitch-600 mt-0.5">Rôle : {invite.role}</p>
              </div>
              <Button
                size="sm"
                onClick={() => acceptInvite(invite.token)}
                disabled={acceptingToken !== null}
              >
                {acceptingToken === invite.token ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Accepter"
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-lg mx-auto space-y-4 p-4 rounded-xl border border-stadium-200 bg-white">
        <p className="text-sm font-medium text-stadium-800 flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Code ou lien d&apos;invitation
        </p>
        <div className="space-y-2">
          <Label htmlFor="inviteCode">Collez le lien ou le code reçu par e-mail</Label>
          <Input
            id="inviteCode"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            placeholder="https://.../invite/abc123 ou abc123"
            className="h-11"
          />
        </div>
        <Button
          className="w-full"
          onClick={() => acceptInvite(inviteInput)}
          disabled={!inviteInput.trim() || acceptingToken !== null}
        >
          {acceptingToken === inviteInput ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Vérification...
            </>
          ) : (
            "Rejoindre le club"
          )}
        </Button>
      </div>

      <div className="max-w-lg mx-auto flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50/80">
        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-medium">Pas encore d&apos;invitation ?</p>
          <p className="mt-1 text-amber-800">
            Demandez à l&apos;administrateur du club de vous inviter avec la même
            adresse e-mail que votre compte. Vous pourrez revenir ici à tout moment.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center max-w-lg mx-auto">{error}</p>
      )}

      <div className="flex justify-center pt-2">
        <Button type="button" variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </div>
    </div>
  )
}
