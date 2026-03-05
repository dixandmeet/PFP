import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  ClubProfileForm,
  type ClubProfileInitialData,
} from "@/components/club/profile/ClubProfileForm"

export default async function ClubProfileEditPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Charger le profil club directement côté serveur (pas de flash loading)
  const clubProfile = await prisma.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      clubName: true,
      shortName: true,
      clubType: true,
      country: true,
      city: true,
      league: true,
      division: true,
      bio: true,
      website: true,
      foundedYear: true,
      logo: true,
      coverPhoto: true,
      updatedAt: true,
    },
  })

  if (!clubProfile) {
    redirect("/club/dashboard")
  }

  // Sérialiser les dates pour le client component
  const initialData: ClubProfileInitialData = {
    id: clubProfile.id,
    clubName: clubProfile.clubName,
    shortName: clubProfile.shortName,
    clubType: clubProfile.clubType,
    country: clubProfile.country,
    city: clubProfile.city,
    league: clubProfile.league,
    division: clubProfile.division,
    bio: clubProfile.bio,
    website: clubProfile.website,
    foundedYear: clubProfile.foundedYear,
    logo: clubProfile.logo,
    coverPhoto: clubProfile.coverPhoto,
    updatedAt: clubProfile.updatedAt.toISOString(),
  }

  return <ClubProfileForm initialData={initialData} />
}
