export interface Listing {
  id: string
  title: string | null
  description: string | null
  position: string
  minAge?: number | null
  maxAge?: number | null
  nationality: string[]
  salaryMin?: number | null
  salaryMax?: number | null
  currency: string | null
  contractType?: string | null
  startDate?: string | null
  publishedAt: string | null
  clubProfile: {
    id: string
    clubName: string | null
    country: string | null
    city?: string | null
    logo?: string | null
    league?: string | null
  }
  hasApplied?: boolean
  consulted?: boolean
  consultationCost?: number
}
