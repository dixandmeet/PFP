"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

// Redirection vers la page fusionnée Opportunités/Candidatures
export default function PlayerApplicationsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la page opportunités avec la vue candidatures active
    router.replace("/player/opportunities?view=applications")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-flex p-4 bg-gradient-to-br from-pitch-100 to-pitch-50 rounded-full mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-pitch-600" />
        </div>
        <p className="text-stadium-600 font-semibold">Redirection en cours...</p>
      </div>
    </div>
  )
}
