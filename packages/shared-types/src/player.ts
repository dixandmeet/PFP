export interface PlayerProfile {
  id: string
  userId: string
  firstName: string | null
  lastName: string | null
  dateOfBirth: string | null
  nationality: string | null
  position: string | null
  secondaryPosition: string | null
  preferredFoot: string | null
  height: number | null
  weight: number | null
  currentClub: string | null
  contractEnd: string | null
  bio: string | null
  photoUrl: string | null
  coverUrl: string | null
  videoUrl: string | null
  slug: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface CareerEntry {
  id: string
  playerProfileId: string
  club: string
  league: string | null
  country: string | null
  season: string
  appearances: number | null
  goals: number | null
  assists: number | null
  startDate: string | null
  endDate: string | null
}

export interface PlayerProfileWithCareer extends PlayerProfile {
  career: CareerEntry[]
}
