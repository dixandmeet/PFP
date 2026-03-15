"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StaffSkillsRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/club/staff/profile?section=skills")
  }, [router])
  return null
}
