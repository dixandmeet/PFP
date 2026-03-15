// API: Current user profile
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { isClubRole } from "@/lib/utils/role-helpers"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        playerProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            dateOfBirth: true,
            nationality: true,
            secondNationality: true,
            height: true,
            weight: true,
            strongFoot: true,
            primaryPosition: true,
            secondaryPositions: true,
            currentClub: true,
            currentLeague: true,
            bio: true,
            profilePicture: true,
            coverPhoto: true,
            isPublic: true,
            careerEntries: {
              select: { id: true },
              take: 1,
            },
          }
        },
        agentProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            coverPhoto: true,
            agencyName: true,
            bio: true,
            specialties: true,
            isVerified: true,
          }
        },
        clubProfile: {
          select: {
            id: true,
            clubName: true,
            shortName: true,
            clubType: true,
            logo: true,
            coverPhoto: true,
            country: true,
            city: true,
            league: true,
            bio: true,
            foundedYear: true,
            isVerified: true,
          }
        },
        clubStaffProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            profilePicture: true,
            bio: true,
            phone: true,
            experience: true,
            skills: true,
          }
        },
      }
    })

    if (!fullUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Déterminer si l'utilisateur a complété son profil
    // Vérifie TOUS les profils (pas seulement celui du rôle actuel)
    // pour empêcher un changement de rôle si un profil existe déjà
    const hasAnyProfile = !!(fullUser.playerProfile || fullUser.agentProfile || fullUser.clubProfile)
    
    // hasProfile = true si le profil correspondant au rôle actuel existe
    let hasProfile = false
    if (fullUser.role === "PLAYER" && fullUser.playerProfile) {
      hasProfile = true
    } else if (fullUser.role === "AGENT" && fullUser.agentProfile) {
      hasProfile = true
    } else if (isClubRole(fullUser.role) && fullUser.clubProfile) {
      hasProfile = true
    }
    
    // Si un profil existe pour N'IMPORTE QUEL rôle, on considère hasProfile = true
    // pour empêcher l'accès à l'onboarding
    if (hasAnyProfile) {
      hasProfile = true
    }

    return NextResponse.json({
      ...fullUser,
      hasProfile
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// PATCH: Update current user (role change during onboarding)
const updateMeSchema = z.object({
  role: z.enum(["PLAYER", "AGENT", "CLUB"]).optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateMeSchema.parse(body)

    // Vérifier que l'utilisateur n'a pas déjà un profil créé
    // (on ne peut changer de rôle que pendant l'onboarding)
    if (validatedData.role) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          playerProfile: { select: { id: true } },
          agentProfile: { select: { id: true } },
          clubProfile: { select: { id: true } },
        }
      })

      const hasAnyProfile = user?.playerProfile || user?.agentProfile || user?.clubProfile
      if (hasAnyProfile) {
        return NextResponse.json(
          { error: "Impossible de changer de rôle après avoir créé un profil" },
          { status: 400 }
        )
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: validatedData.role },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
