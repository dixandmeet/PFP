export interface StaffCompletionInput {
  firstName?: string | null
  lastName?: string | null
  jobTitle?: string | null
  bio?: string | null
  phone?: string | null
  profilePicture?: string | null
  experience?: unknown[] | null
  skills?: string[] | null
}

export function calculateStaffCompletion(profile: StaffCompletionInput) {
  const fields = [
    { value: profile.firstName, label: "Prénom" },
    { value: profile.lastName, label: "Nom" },
    { value: profile.jobTitle, label: "Poste" },
    { value: profile.bio, label: "Bio" },
    { value: profile.phone, label: "Téléphone" },
    { value: profile.profilePicture, label: "Photo" },
    {
      value:
        profile.experience &&
        Array.isArray(profile.experience) &&
        profile.experience.length > 0,
      label: "Expérience",
    },
    {
      value: profile.skills && profile.skills.length > 0,
      label: "Compétences",
    },
  ]
  const completed = fields.filter((f) => f.value).length
  const missing = fields.filter((f) => !f.value).map((f) => f.label)
  return {
    percentage: Math.round((completed / fields.length) * 100),
    missing,
  }
}

export function getStaffDisplayName(profile: StaffCompletionInput): string {
  if (profile.firstName || profile.lastName) {
    return [profile.firstName, profile.lastName].filter(Boolean).join(" ")
  }
  return "Staff"
}
