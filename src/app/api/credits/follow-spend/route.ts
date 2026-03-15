// API: Dépenser 1 crédit pour suivre un profil et accéder à son contenu
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { WalletService, FollowBillingService } from "@/lib/services/credits"
import { EntityType } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth()

    const body = await request.json()
    const { targetUserId } = body

    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId est requis" },
        { status: 400 }
      )
    }

    // Vérifier qu'on ne se suit pas soi-même
    if (currentUser.id === targetUserId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous suivre vous-même" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur cible existe et récupérer son profil
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        role: true,
        playerProfile: { select: { id: true } },
        agentProfile: { select: { id: true } },
        clubProfile: { select: { id: true } },
      },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier si déjà suivi
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    })

    if (existingFollow) {
      return NextResponse.json(
        { error: "Vous suivez déjà cet utilisateur", alreadyFollowing: true },
        { status: 400 }
      )
    }

    // Vérifier le solde de crédits
    const canAfford = await WalletService.canAfford(currentUser.id, 1)
    if (!canAfford) {
      return NextResponse.json(
        { error: "Crédits insuffisants. Rechargez votre compte.", insufficientCredits: true },
        { status: 402 }
      )
    }

    // Valider le follow (anti-fraude)
    const validation = await FollowBillingService.validateFollow(currentUser.id, targetUserId)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      )
    }

    // Transaction atomique : débiter 1 crédit + créer le follow
    const result = await prisma.$transaction(async (tx) => {
      // 1. Débiter 1 crédit
      const breakdown = await WalletService.debitWithPriority(
        tx,
        currentUser.id,
        1,
        "DEBIT_FOLLOW",
        {
          referenceType: "FOLLOW",
          counterpartyId: targetUserId,
          description: "Crédit dépensé pour suivre un profil",
          idempotencyKey: `follow_spend_${currentUser.id}_${targetUserId}`,
        }
      )

      // 2. Créer le follow User-to-User
      const follow = await tx.follow.create({
        data: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      })

      // 3. Créer aussi l'EntityFollow si applicable
      let entityFollow = null
      let entityType: EntityType | null = null
      let entityId: string | null = null

      if (targetUser.playerProfile) {
        entityType = "PLAYER"
        entityId = targetUser.playerProfile.id
      } else if (targetUser.agentProfile) {
        entityType = "AGENT"
        entityId = targetUser.agentProfile.id
      } else if (targetUser.clubProfile) {
        entityType = "CLUB"
        entityId = targetUser.clubProfile.id
      }

      if (entityType && entityId) {
        entityFollow = await tx.entityFollow.create({
          data: {
            userId: currentUser.id,
            entityId: entityId,
            entityType: entityType,
          },
        })
      }

      // 4. Créer une notification
      await tx.notification.create({
        data: {
          userId: targetUserId,
          type: "FOLLOW",
          title: "Nouveau follower",
          message: `Quelqu'un vous suit maintenant`,
          link: `/profile/${currentUser.id}`,
        },
      })

      return { follow, entityFollow, breakdown }
    })

    // 5. Enregistrer le follow pour la facturation mensuelle
    if (result.entityFollow) {
      await FollowBillingService.onFollow(
        currentUser.id,
        targetUserId,
        result.entityFollow.id
      )
    }

    // Récupérer le nouveau solde
    const newBalance = await WalletService.getTotalBalance(currentUser.id)

    return NextResponse.json({
      success: true,
      isFollowing: true,
      creditSpent: 1,
      remainingCredits: newBalance,
    })
  } catch (error: any) {
    // Gérer le cas où le follow existe déjà (race condition)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Vous suivez déjà cet utilisateur", alreadyFollowing: true },
        { status: 400 }
      )
    }
    return handleApiError(error)
  }
}
