// API: Follow/Unfollow des entités (clubs, joueurs, agents)
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { EntityType } from "@prisma/client"
import { FollowBillingService } from "@/lib/services/credits"

// GET - Vérifier le statut de suivi d'une entité
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: entityId } = await params
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("type") as EntityType | null

    // Vérifier le suivi et compter les followers en parallèle
    let isFollowing = false
    let currentUser: any = null
    try {
      currentUser = await requireAuth()
    } catch {
      // Non authentifié
    }

    const followWhereClause: any = {
      entityId: entityId,
      ...(entityType && { entityType }),
    }

    const [follow, followersCount] = await Promise.all([
      currentUser
        ? prisma.entityFollow.findFirst({
            where: {
              userId: currentUser.id,
              entityId: entityId,
              ...(entityType && { entityType }),
            },
          })
        : null,
      prisma.entityFollow.count({
        where: followWhereClause,
      }),
    ])

    isFollowing = !!follow

    return NextResponse.json({
      isFollowing,
      followersCount,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST - Suivre une entité (club, joueur, agent)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth()
    const { id: entityId } = await params
    
    // Récupérer le type d'entité depuis le body ou les query params
    let entityType: EntityType
    try {
      const body = await request.json()
      entityType = body.type as EntityType
    } catch {
      const { searchParams } = new URL(request.url)
      entityType = searchParams.get("type") as EntityType
    }

    if (!entityType || !["CLUB", "PLAYER", "AGENT"].includes(entityType)) {
      return NextResponse.json(
        { error: "Type d'entité invalide. Doit être CLUB, PLAYER ou AGENT" },
        { status: 400 }
      )
    }

    // Résoudre le userId de l'entité suivie (pour la facturation crédit)
    let followedUserId: string | null = null
    if (entityType === "CLUB") {
      const club = await prisma.clubProfile.findUnique({ where: { id: entityId }, select: { userId: true } })
      followedUserId = club?.userId || null
    } else if (entityType === "PLAYER") {
      const player = await prisma.playerProfile.findUnique({ where: { id: entityId }, select: { userId: true } })
      followedUserId = player?.userId || null
    } else if (entityType === "AGENT") {
      const agent = await prisma.agentProfile.findUnique({ where: { id: entityId }, select: { userId: true } })
      followedUserId = agent?.userId || null
    }

    // Valider le follow (anti-fraude, self-follow, boucles)
    if (followedUserId) {
      const validation = await FollowBillingService.validateFollow(currentUser.id, followedUserId)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.reason }, { status: 400 })
      }
    }

    // Créer le follow
    const follow = await prisma.entityFollow.create({
      data: {
        userId: currentUser.id,
        entityId: entityId,
        entityType: entityType,
      },
    })

    // Enregistrer le follow pour la facturation mensuelle
    if (followedUserId) {
      await FollowBillingService.onFollow(currentUser.id, followedUserId, follow.id)
    }

    return NextResponse.json({
      success: true,
      follow,
      isFollowing: true,
    })
  } catch (error: any) {
    // Gérer le cas où le follow existe déjà
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Vous suivez déjà cette entité" },
        { status: 400 }
      )
    }
    return handleApiError(error)
  }
}

// DELETE - Ne plus suivre une entité
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth()
    const { id: entityId } = await params
    
    // Récupérer le type d'entité
    let entityType: EntityType | null = null
    try {
      const body = await request.json()
      entityType = body.type as EntityType
    } catch {
      const { searchParams } = new URL(request.url)
      entityType = searchParams.get("type") as EntityType | null
    }

    // Trouver et supprimer le follow
    const whereClause: any = {
      userId: currentUser.id,
      entityId: entityId,
    }
    
    if (entityType) {
      whereClause.entityType = entityType
    }

    const existingFollow = await prisma.entityFollow.findFirst({
      where: whereClause,
    })

    if (!existingFollow) {
      return NextResponse.json(
        { error: "Vous ne suivez pas cette entité" },
        { status: 400 }
      )
    }

    await prisma.entityFollow.delete({
      where: { id: existingFollow.id },
    })

    // Désactiver la facturation crédit pour ce follow
    let followedUserId: string | null = null
    if (existingFollow.entityType === "CLUB") {
      const club = await prisma.clubProfile.findUnique({ where: { id: entityId }, select: { userId: true } })
      followedUserId = club?.userId || null
    } else if (existingFollow.entityType === "PLAYER") {
      const player = await prisma.playerProfile.findUnique({ where: { id: entityId }, select: { userId: true } })
      followedUserId = player?.userId || null
    } else if (existingFollow.entityType === "AGENT") {
      const agent = await prisma.agentProfile.findUnique({ where: { id: entityId }, select: { userId: true } })
      followedUserId = agent?.userId || null
    }

    if (followedUserId) {
      await FollowBillingService.onUnfollow(currentUser.id, followedUserId)
    }

    return NextResponse.json({
      success: true,
      isFollowing: false,
    })
  } catch (error: any) {
    return handleApiError(error)
  }
}
