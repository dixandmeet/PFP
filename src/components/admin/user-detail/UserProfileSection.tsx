"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Shield,
  Building2,
  StickyNote,
} from "lucide-react"
import type { FormUser, ValidationErrors } from "./types"

interface UserProfileSectionProps {
  formUser: FormUser
  isEditing: boolean
  errors: ValidationErrors
  onChange: (path: string, value: string) => void
}

function FieldDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-sm text-slate-900">{value || "-"}</p>
    </div>
  )
}

function FieldInput({
  label,
  value,
  path,
  onChange,
  error,
  type = "text",
  readOnly = false,
}: {
  label: string
  value: string
  path: string
  onChange: (path: string, value: string) => void
  error?: string
  type?: string
  readOnly?: boolean
}) {
  return (
    <div>
      <Label className="text-xs font-medium text-slate-500">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(path, e.target.value)}
        type={type}
        readOnly={readOnly}
        className={`mt-1 ${error ? "border-red-300 focus-visible:ring-red-500" : ""} ${readOnly ? "bg-slate-50 cursor-not-allowed" : ""}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

const positionOptions = [
  { value: "GK", label: "Gardien" },
  { value: "DF", label: "Defenseur" },
  { value: "MF", label: "Milieu" },
  { value: "FW", label: "Attaquant" },
]

const roleOptions = [
  { value: "PLAYER", label: "Joueur" },
  { value: "AGENT", label: "Agent" },
  { value: "CLUB", label: "Club" },
  { value: "ADMIN", label: "Admin" },
]

export function UserProfileSection({
  formUser,
  isEditing,
  errors,
  onChange,
}: UserProfileSectionProps) {
  return (
    <div className="space-y-6">
      {/* Identite & Compte */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border-b">
          <User className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Identite & Compte</h3>
        </div>
        <div className="p-6">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldInput
                label="Nom"
                value={formUser.name}
                path="name"
                onChange={onChange}
                error={errors.name}
              />
              <FieldInput
                label="Email"
                value={formUser.email}
                path="email"
                onChange={onChange}
                error={errors.email}
                type="email"
                readOnly
              />
              <div>
                <Label className="text-xs font-medium text-slate-500">Role</Label>
                <Select
                  value={formUser.role}
                  onValueChange={(v) => onChange("role", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FieldDisplay label="Nom" value={formUser.name} />
              <FieldDisplay label="Email" value={formUser.email} />
              <FieldDisplay
                label="Role"
                value={roleOptions.find((r) => r.value === formUser.role)?.label || formUser.role}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Profil Joueur */}
      {formUser.playerProfile && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border-b">
            <Shield className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Profil Joueur</h3>
          </div>
          <div className="p-6">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldInput
                  label="Prenom"
                  value={formUser.playerProfile.firstName}
                  path="playerProfile.firstName"
                  onChange={onChange}
                  error={errors["playerProfile.firstName"]}
                />
                <FieldInput
                  label="Nom"
                  value={formUser.playerProfile.lastName}
                  path="playerProfile.lastName"
                  onChange={onChange}
                  error={errors["playerProfile.lastName"]}
                />
                <div>
                  <Label className="text-xs font-medium text-slate-500">Position</Label>
                  <Select
                    value={formUser.playerProfile.primaryPosition}
                    onValueChange={(v) => onChange("playerProfile.primaryPosition", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FieldInput
                  label="Club actuel"
                  value={formUser.playerProfile.currentClub}
                  path="playerProfile.currentClub"
                  onChange={onChange}
                />
                <FieldInput
                  label="Nationalite"
                  value={formUser.playerProfile.nationality}
                  path="playerProfile.nationality"
                  onChange={onChange}
                />
                <FieldInput
                  label="Date de naissance"
                  value={formUser.playerProfile.dateOfBirth}
                  path="playerProfile.dateOfBirth"
                  onChange={onChange}
                  error={errors["playerProfile.dateOfBirth"]}
                  type="date"
                />
                <div className="md:col-span-2">
                  <Label className="text-xs font-medium text-slate-500">Bio</Label>
                  <Textarea
                    value={formUser.playerProfile.bio}
                    onChange={(e) => onChange("playerProfile.bio", e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FieldDisplay label="Prenom" value={formUser.playerProfile.firstName} />
                <FieldDisplay label="Nom" value={formUser.playerProfile.lastName} />
                <FieldDisplay
                  label="Position"
                  value={
                    positionOptions.find((p) => p.value === formUser.playerProfile!.primaryPosition)
                      ?.label || formUser.playerProfile.primaryPosition
                  }
                />
                <FieldDisplay label="Club actuel" value={formUser.playerProfile.currentClub} />
                <FieldDisplay label="Nationalite" value={formUser.playerProfile.nationality} />
                <FieldDisplay label="Date de naissance" value={formUser.playerProfile.dateOfBirth} />
                {formUser.playerProfile.bio && (
                  <div className="col-span-2 md:col-span-4">
                    <FieldDisplay label="Bio" value={formUser.playerProfile.bio} />
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Profil Agent */}
      {formUser.agentProfile && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border-b">
            <Building2 className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Profil Agent</h3>
          </div>
          <div className="p-6">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldInput
                  label="Prenom"
                  value={formUser.agentProfile.firstName}
                  path="agentProfile.firstName"
                  onChange={onChange}
                />
                <FieldInput
                  label="Nom"
                  value={formUser.agentProfile.lastName}
                  path="agentProfile.lastName"
                  onChange={onChange}
                />
                <FieldInput
                  label="Agence"
                  value={formUser.agentProfile.agencyName}
                  path="agentProfile.agencyName"
                  onChange={onChange}
                />
                <FieldInput
                  label="N Licence"
                  value={formUser.agentProfile.licenseNumber}
                  path="agentProfile.licenseNumber"
                  onChange={onChange}
                />
                <FieldInput
                  label="Pays licence"
                  value={formUser.agentProfile.licenseCountry}
                  path="agentProfile.licenseCountry"
                  onChange={onChange}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FieldDisplay label="Prenom" value={formUser.agentProfile.firstName} />
                <FieldDisplay label="Nom" value={formUser.agentProfile.lastName} />
                <FieldDisplay label="Agence" value={formUser.agentProfile.agencyName || "Independant"} />
                <FieldDisplay label="N Licence" value={formUser.agentProfile.licenseNumber} />
                <FieldDisplay label="Pays licence" value={formUser.agentProfile.licenseCountry} />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Profil Club */}
      {formUser.clubProfile && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border-b">
            <Building2 className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Profil Club</h3>
          </div>
          <div className="p-6">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldInput
                  label="Nom du club"
                  value={formUser.clubProfile.clubName}
                  path="clubProfile.clubName"
                  onChange={onChange}
                />
                <FieldInput
                  label="Pays"
                  value={formUser.clubProfile.country}
                  path="clubProfile.country"
                  onChange={onChange}
                />
                <FieldInput
                  label="Ligue"
                  value={formUser.clubProfile.league}
                  path="clubProfile.league"
                  onChange={onChange}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FieldDisplay label="Nom du club" value={formUser.clubProfile.clubName} />
                <FieldDisplay label="Pays" value={formUser.clubProfile.country} />
                <FieldDisplay label="Ligue" value={formUser.clubProfile.league} />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Notes internes admin */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border-b">
          <StickyNote className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Notes internes</h3>
        </div>
        <div className="p-6">
          {isEditing ? (
            <Textarea
              value={formUser.adminNotes}
              onChange={(e) => onChange("adminNotes", e.target.value)}
              rows={4}
              placeholder="Notes visibles uniquement par les administrateurs..."
            />
          ) : (
            <p className="text-sm text-slate-600">
              {formUser.adminNotes || "Aucune note."}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
