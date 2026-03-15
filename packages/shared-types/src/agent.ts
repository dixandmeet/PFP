export interface AgentProfile {
  id: string
  userId: string
  firstName: string | null
  lastName: string | null
  agency: string | null
  licenseNumber: string | null
  specialities: string[]
  bio: string | null
  photoUrl: string | null
  coverUrl: string | null
  phone: string | null
  location: string | null
  slug: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
}
