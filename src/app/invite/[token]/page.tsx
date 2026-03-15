"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSession, useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function InviteAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const { update: updateSession } = useSession()
  const token = params.token as string
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("Lien d'invitation invalide.")
      return
    }

    let cancelled = false

    async function run() {
      const session = await getSession()
      if (!session?.user) {
        const callbackUrl = `/invite/${token}`
        router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
        return
      }

      try {
        const res = await fetch("/api/club/members/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        const data = await res.json().catch(() => ({}))

        if (cancelled) return

        if (!res.ok) {
          setStatus("error")
          setErrorMessage(data?.error ?? "Cette invitation n'est plus valide ou a déjà été utilisée.")
          return
        }

        // Mettre à jour le JWT avec le nouveau rôle
        const newRole = data.staffOnboarding ? "CLUB_STAFF" : "CLUB"
        await updateSession({ role: newRole })
        if (cancelled) return
        router.replace(data.staffOnboarding ? "/club/staff-onboarding" : "/club/dashboard")
      } catch {
        if (!cancelled) {
          setStatus("error")
          setErrorMessage("Une erreur est survenue. Veuillez réessayer.")
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [token, router, updateSession])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-stadium-50 to-white p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-pitch-500 border-t-transparent rounded-full mb-6"
        />
        <p className="text-pitch-700 font-medium">Acceptation de l'invitation en cours...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-stadium-50 to-white p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <span className="text-2xl text-red-600">!</span>
          </div>
          <h1 className="text-xl font-bold text-pitch-900">Invitation invalide</h1>
          <p className="text-pitch-600">{errorMessage}</p>
          <p className="text-sm text-pitch-500">
            Si le lien a déjà été utilisé ou a expiré, demandez à l'administrateur du club de vous renvoyer une invitation.
          </p>
          <Button asChild variant="default">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    )
  }

  return null
}
