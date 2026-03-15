"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Loader2, User } from "lucide-react"

interface StaffProfile {
  firstName?: string | null
  lastName?: string | null
  jobTitle?: string | null
  bio?: string | null
  phone?: string | null
}

interface StaffStep1Props {
  profile: StaffProfile | null
  onComplete: () => void
}

export function StaffStep1Profile({ profile, onComplete }: StaffStep1Props) {
  const [form, setForm] = useState({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    jobTitle: profile?.jobTitle || "",
    bio: profile?.bio || "",
    phone: profile?.phone || "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Le prénom et le nom sont requis.")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/club/staff-onboarding/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur lors de la sauvegarde")
      }

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pitch-100 mb-4">
          <User className="w-7 h-7 text-pitch-600" />
        </div>
        <h2 className="text-xl font-bold text-pitch-900">Votre profil</h2>
        <p className="text-sm text-pitch-600 mt-1">
          Renseignez vos informations personnelles pour compléter votre inscription.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="Jean"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Dupont"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Poste / Fonction</Label>
          <Input
            id="jobTitle"
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            placeholder="Ex: Directeur Sportif, Recruteur..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+33 6 12 34 56 78"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio / Présentation</Label>
          <Textarea
            id="bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Quelques mots sur vous et votre rôle..."
            rows={3}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            Continuer
          </Button>
        </div>
      </form>
    </div>
  )
}
