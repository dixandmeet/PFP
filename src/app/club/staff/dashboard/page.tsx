"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  UserCircle,
  Briefcase,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface StaffProfile {
  id: string
  firstName: string | null
  lastName: string | null
  jobTitle: string | null
  bio: string | null
  phone: string | null
  profilePicture: string | null
  experience: unknown[] | null
  skills: string[]
}

function calculateStaffCompletion(profile: StaffProfile) {
  const fields = [
    { value: profile.firstName, label: "Prénom" },
    { value: profile.lastName, label: "Nom" },
    { value: profile.jobTitle, label: "Poste" },
    { value: profile.bio, label: "Bio" },
    { value: profile.phone, label: "Téléphone" },
    { value: profile.profilePicture, label: "Photo" },
    {
      value: profile.experience && Array.isArray(profile.experience) && profile.experience.length > 0,
      label: "Expérience",
    },
    { value: profile.skills && profile.skills.length > 0, label: "Compétences" },
  ]
  const completed = fields.filter((f) => f.value).length
  const missing = fields.filter((f) => !f.value).map((f) => f.label)
  return { percentage: Math.round((completed / fields.length) * 100), missing }
}

export default function StaffDashboardPage() {
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/club/staff/profile")
        if (res.ok) {
          setProfile(await res.json())
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-pitch-500" />
      </div>
    )
  }

  const completion = profile ? calculateStaffCompletion(profile) : null
  const displayName =
    profile?.firstName || profile?.lastName
      ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
      : "Staff"

  const quickActions = [
    {
      title: "Informations",
      description: "Nom, poste, bio, photo",
      href: "/club/staff/profile",
      icon: UserCircle,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Expérience",
      description: "Parcours professionnel",
      href: "/club/staff/profile?section=experience",
      icon: Briefcase,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Compétences",
      description: "Tags et spécialités",
      href: "/club/staff/profile?section=skills",
      icon: Sparkles,
      color: "bg-purple-50 text-purple-600",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {displayName}
        </h1>
        <p className="text-gray-500 mt-1">
          Gérez votre profil personnel de staff du club.
        </p>
      </div>

      {/* Completion card */}
      {completion && completion.percentage < 100 && (
        <div className="mb-8 p-5 rounded-xl border border-amber-200 bg-amber-50/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">
                Profil incomplet — {completion.percentage}%
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Il manque : {completion.missing.join(", ")}
              </p>
              <Link href="/club/staff/profile">
                <Button size="sm" variant="outline" className="mt-3">
                  Compléter mon profil
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group p-5 rounded-xl border border-gray-200 bg-white hover:border-pitch-300 hover:shadow-md transition-all duration-150"
            >
              <div
                className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-pitch-700 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{action.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
