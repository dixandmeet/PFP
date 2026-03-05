export interface CareerEntry {
  id: string
  clubName: string
  league: string | null
  country: string | null
  season: string
  startDate: string
  endDate: string | null
  position: string | null
  appearances: number | null
  minutesPlayed: number | null
  goals: number | null
  assists: number | null
}

export interface ApplicationEntry {
  id: string
  status: string
  coverLetter: string | null
  createdAt: string
  updatedAt: string
  listing: {
    title: string
    position: string
    clubProfile: {
      clubName: string
    }
  }
}

export interface MandateEntry {
  id: string
  status: string
  startDate: string
  endDate: string
  terms: string | null
  createdAt: string
  acceptedAt: string | null
  agentProfile?: {
    firstName: string
    lastName: string
    agencyName: string | null
  }
  playerProfile?: {
    firstName: string
    lastName: string
    primaryPosition: string
  }
}

export interface SubmissionEntry {
  id: string
  status: string
  message: string | null
  createdAt: string
  clubProfile: {
    clubName: string
  }
  listing: {
    title: string
  } | null
}

export interface ConversationEntry {
  conversation: {
    id: string
    lastMessageAt: string | null
    participants: {
      user: {
        id: string
        name: string | null
        email: string
        image: string | null
        role: string
      }
    }[]
    messages: {
      content: string | null
      createdAt: string
      sender: {
        name: string | null
      }
    }[]
    _count: {
      messages: number
    }
  }
}

export interface ListingEntry {
  id: string
  title: string
  description: string
  position: string
  status: string
  publishedAt: string | null
  createdAt: string
  _count: {
    applications: number
  }
}

export interface KycDocumentEntry {
  id: string
  type: string
  status: string
  fileName: string
  fileUrl: string
  fileSize: number | null
  mimeType: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  rejectionReason: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface WalletEntry {
  id: string
  type: "SUBSCRIPTION" | "PURCHASED" | "EARNED" | "BONUS"
  balance: number
  version: number
  createdAt: string
  updatedAt: string
}

export interface CreditTransactionEntry {
  id: string
  walletType: string
  type: string
  status: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  referenceId: string | null
  referenceType: string | null
  counterpartyId: string | null
  description: string | null
  metadata: any
  createdAt: string
}

export interface SubscriptionEntry {
  id: string
  plan: string
  status: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelledAt: string | null
  creditsAllocated: number
  createdAt: string
}

export interface StripeConnectEntry {
  id: string
  stripeAccountId: string
  kycStatus: string
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  createdAt: string
  updatedAt: string
}

export interface WithdrawalEntry {
  id: string
  amount: number
  commission: number
  netAmount: number
  status: string
  stripeConnectAccountId: string | null
  requestedAt: string
  availableAt: string
  processedAt: string | null
  completedAt: string | null
  reviewedBy: string | null
  reviewNote: string | null
  createdAt: string
}

export interface UserDetail {
  id: string
  name: string | null
  email: string
  role: "PLAYER" | "AGENT" | "CLUB" | "ADMIN"
  image: string | null
  createdAt: string
  emailVerified: string | null
  playerProfile: {
    id: string
    firstName: string
    lastName: string
    displayName: string | null
    dateOfBirth: string
    nationality: string
    secondNationality: string | null
    height: number | null
    weight: number | null
    strongFoot: string | null
    primaryPosition: string
    secondaryPositions: string[]
    availableFrom: string | null
    contractEndDate: string | null
    currentClub: string | null
    currentLeague: string | null
    profilePicture: string | null
    coverPhoto: string | null
    videoLinks: string[]
    bio: string | null
    isPublic: boolean
    careerEntries: CareerEntry[]
    applications: ApplicationEntry[]
    mandates: MandateEntry[]
  } | null
  agentProfile: {
    id: string
    firstName: string
    lastName: string
    agencyName: string | null
    licenseNumber: string | null
    licenseCountry: string | null
    bio: string | null
    specialties: string[]
    phoneNumber: string | null
    website: string | null
    isVerified: boolean
    mandates: MandateEntry[]
    submissions: SubmissionEntry[]
  } | null
  clubProfile: {
    id: string
    clubName: string
    shortName: string | null
    country: string
    city: string | null
    league: string | null
    division: string | null
    logo: string | null
    website: string | null
    bio: string | null
    foundedYear: number | null
    isVerified: boolean
    teams: {
      id: string
      name: string
      level: string | null
      staffMembers: {
        id: string
        name: string
        role: string
        email: string | null
      }[]
    }[]
    listings: ListingEntry[]
  } | null
  posts: {
    id: string
    content: string
    mediaUrls: string[]
    createdAt: string
    _count: {
      likes: number
      comments: number
    }
  }[]
  conversations: ConversationEntry[]
  // Documents KYC
  kycDocuments: KycDocumentEntry[]
  // Finance
  subscription: SubscriptionEntry | null
  wallets: WalletEntry[]
  creditTransactions: CreditTransactionEntry[]
  withdrawals: WithdrawalEntry[]
  stripeConnect: StripeConnectEntry | null
  auditLogs: {
    id: string
    action: string
    targetType: string | null
    targetId: string | null
    metadata: any
    createdAt: string
  }[]
  _count: {
    posts: number
    comments: number
    likes: number
    followedBy: number
    following: number
    conversations: number
    sentMessages: number
  }
}

export interface FormUser {
  name: string
  email: string
  role: "PLAYER" | "AGENT" | "CLUB" | "ADMIN"
  playerProfile: {
    firstName: string
    lastName: string
    primaryPosition: string
    currentClub: string
    nationality: string
    dateOfBirth: string
    bio: string
  } | null
  agentProfile: {
    firstName: string
    lastName: string
    agencyName: string
    licenseNumber: string
    licenseCountry: string
  } | null
  clubProfile: {
    clubName: string
    country: string
    league: string
  } | null
  adminNotes: string
}

export interface ValidationErrors {
  [key: string]: string
}

export function userToFormUser(user: UserDetail): FormUser {
  return {
    name: user.name || "",
    email: user.email,
    role: user.role,
    playerProfile: user.playerProfile
      ? {
          firstName: user.playerProfile.firstName || "",
          lastName: user.playerProfile.lastName || "",
          primaryPosition: user.playerProfile.primaryPosition || "",
          currentClub: user.playerProfile.currentClub || "",
          nationality: user.playerProfile.nationality || "",
          dateOfBirth: user.playerProfile.dateOfBirth
            ? new Date(user.playerProfile.dateOfBirth).toISOString().split("T")[0]
            : "",
          bio: user.playerProfile.bio || "",
        }
      : null,
    agentProfile: user.agentProfile
      ? {
          firstName: user.agentProfile.firstName || "",
          lastName: user.agentProfile.lastName || "",
          agencyName: user.agentProfile.agencyName || "",
          licenseNumber: user.agentProfile.licenseNumber || "",
          licenseCountry: user.agentProfile.licenseCountry || "",
        }
      : null,
    clubProfile: user.clubProfile
      ? {
          clubName: user.clubProfile.clubName || "",
          country: user.clubProfile.country || "",
          league: user.clubProfile.league || "",
        }
      : null,
    adminNotes: "",
  }
}
