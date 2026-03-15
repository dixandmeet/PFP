import type { ApplicationStatus, ListingStatus } from "@pfp/shared-constants"

export interface Listing {
  id: string
  clubProfileId: string
  title: string
  description: string
  position: string
  level: string | null
  ageRange: string | null
  salary: string | null
  contractType: string | null
  location: string | null
  status: ListingStatus
  creditCost: number
  consultCount: number
  createdAt: string
  updatedAt: string
  club?: {
    id: string
    clubName: string
    logoUrl: string | null
  }
}

export interface Application {
  id: string
  listingId: string
  playerProfileId: string
  status: ApplicationStatus
  coverLetter: string | null
  createdAt: string
  updatedAt: string
  listing?: Listing
}
