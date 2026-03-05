// API: Follow/Unfollow un utilisateur
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"

// GET - Vérifier le statut de suivi et obtenir les statistiques
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params

    // Optionnel: vérifier si l'utilisateur actuel suit ce profil
    let isFollowing = false
    try {
      const currentUser = await requireAuth()
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: targetUserId,
          },
        },
      })
      isFollowing = !!follow
    } catch {
      // Non authentifié, isFollowing reste false
    }

    // Compter les followers et following
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: targetUserId } }),
      prisma.follow.count({ where: { followerId: targetUserId } }),
    ])

    return NextResponse.json({
      isFollowing,
      followersCount,
      followingCount,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST - Suivre un utilisateur
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth()
    const { id: targetUserId } = await params

    // Vérifier qu'on ne se suit pas soi-même
    if (currentUser.id === targetUserId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous suivre vous-même" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Créer le follow
    const follow = await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: targetUserId,
      },
    })

    // Créer une notification
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: "FOLLOW",
        title: "Nouveau follower",
        message: `${currentUser.email} vous suit maintenant`,
        link: `/profile/${currentUser.id}`,
      },
    })

    return NextResponse.json({ success: true, follow })
  } catch (error: any) {
    // Gérer le cas où le follow existe déjà
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Vous suivez déjà cet utilisateur" },
        { status: 400 }
      )
    }
    return handleApiError(error)
  }
}

// DELETE - Ne plus suivre un utilisateur
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth()
    const { id: targetUserId } = await params

    // Supprimer le follow
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Gérer le cas où le follow n'existe pas
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Vous ne suivez pas cet utilisateur" },
        { status: 400 }
      )
    }
    return handleApiError(error)
  }
}
