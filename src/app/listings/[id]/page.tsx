import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isClubRole } from "@/lib/utils/role-helpers"
import { ListingDetailClient } from "./ListingDetailClient"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      title: true,
      position: true,
      status: true,
      clubProfile: { select: { userId: true } },
    },
  })

  if (!listing) {
    return { title: "Annonce introuvable · Profoot Profile" }
  }

  const session = await auth()
  const isOwner = session?.user?.id === listing.clubProfile.userId
  const isAdmin = session?.user?.role === "ADMIN"
  if (listing.status !== "PUBLISHED" && !isOwner && !isAdmin) {
    return { title: "Annonce introuvable · Profoot Profile" }
  }

  return {
    title: `${listing.title} · ${listing.position} · Profoot Profile`,
    description: `Opportunité ${listing.position} — ${listing.title}`,
  }
}

export default async function ListingPublicPage({ params }: Props) {
  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      clubProfileId: true,
      clubProfile: { select: { userId: true } },
    },
  })

  if (!listing) {
    notFound()
  }

  const session = await auth()
  const isOwner = session?.user?.id === listing.clubProfile.userId
  const isAdmin = session?.user?.role === "ADMIN"
  if (listing.status !== "PUBLISHED" && !isOwner && !isAdmin) {
    notFound()
  }

  let canViewApplications = false
  if (session?.user) {
    if (session.user.role === "ADMIN") {
      canViewApplications = true
    } else if (session.user.id === listing.clubProfile.userId) {
      canViewApplications = true
    } else if (isClubRole(session.user.role)) {
      const ownClub = await prisma.clubProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
      if (ownClub?.id === listing.clubProfileId) {
        canViewApplications = true
      } else {
        const membership = await prisma.clubMember.findFirst({
          where: {
            clubProfileId: listing.clubProfileId,
            userId: session.user.id,
            status: "ACTIVE",
          },
        })
        canViewApplications = !!membership
      }
    }
  }

  return (
    <ListingDetailClient
      listingId={id}
      userId={session?.user?.id ?? null}
      userRole={session?.user?.role ?? null}
      canViewApplications={canViewApplications}
    />
  )
}
