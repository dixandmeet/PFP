"use client"

import { useState, useEffect } from "react"
import { MessagingPanel } from "@/components/messaging/MessagingPanel"
import { Loader2 } from "lucide-react"

export function MessagesPageContent() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/users/me")
        if (res.ok) {
          const data = await res.json()
          setCurrentUserId(data.id)
        }
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  if (loading || !currentUserId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="h-8 w-8 animate-spin text-pitch-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 overflow-hidden h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)]">
        <MessagingPanel
          currentUserId={currentUserId}
          onClose={() => {}}
        />
      </div>
    </div>
  )
}
