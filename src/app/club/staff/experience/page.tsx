"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StaffExperienceRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/club/staff/profile?section=experience")
  }, [router])
  return null
}
