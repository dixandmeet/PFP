import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

// GET - Get single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        playerProfile: {
          select: {
            id: true,
            userId: true,
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
            availableFrom: true,
            contractEndDate: true,
            currentClub: true,
            currentLeague: true,
            profilePicture: true,
            coverPhoto: true,
            videoLinks: true,
            bio: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
            careerEntries: {
              orderBy: { startDate: "desc" },
            },
            applications: {
              orderBy: { createdAt: "desc" },
              include: {
                listing: {
                  select: {
                    title: true,
                    position: true,
                    clubProfile: {
                      select: { clubName: true },
                    },
                  },
                },
              },
            },
            mandates: {
              orderBy: { createdAt: "desc" },
              include: {
                agentProfile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    agencyName: true,
                  },
                },
              },
            },
          },
        },
        agentProfile: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            agencyName: true,
            licenseNumber: true,
            licenseCountry: true,
            bio: true,
            specialties: true,
            phoneNumber: true,
            website: true,
            profilePicture: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
            mandates: {
              orderBy: { createdAt: "desc" },
              include: {
                playerProfile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    primaryPosition: true,
                  },
                },
              },
            },
            submissions: {
              orderBy: { createdAt: "desc" },
              include: {
                clubProfile: {
                  select: { clubName: true },
                },
                listing: {
                  select: { title: true },
                },
              },
            },
          },
        },
        clubProfile: {
          select: {
            id: true,
            userId: true,
            clubName: true,
            shortName: true,
            country: true,
            city: true,
            league: true,
            division: true,
            logo: true,
            website: true,
            bio: true,
            foundedYear: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
            teams: {
              include: {
                staffMembers: true,
              },
            },
            listings: {
              orderBy: { createdAt: "desc" },
              include: {
                _count: {
                  select: { applications: true },
                },
              },
            },
          },
        },
        posts: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
        conversations: {
          orderBy: { createdAt: "desc" },
          include: {
            conversation: {
              include: {
                participants: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        role: true,
                      },
                    },
                  },
                },
                messages: {
                  take: 1,
                  orderBy: { createdAt: "desc" },
                  select: {
                    content: true,
                    createdAt: true,
                    sender: {
                      select: { name: true },
                    },
                  },
                },
                _count: {
                  select: { messages: true },
                },
              },
            },
          },
        },
        auditLogs: {
          take: 30,
          orderBy: { createdAt: "desc" },
        },
        // Documents KYC
        kycDocuments: {
          orderBy: { createdAt: "desc" },
        },
        // Credits & Finance
        subscription: true,
        wallets: {
          orderBy: { type: "asc" },
        },
        creditTransactions: {
          take: 50,
          orderBy: { createdAt: "desc" },
        },
        withdrawals: {
          orderBy: { createdAt: "desc" },
        },
        stripeConnect: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
            followedBy: true,
            following: true,
            conversations: true,
            sentMessages: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 }
    )
  }
}

// PATCH - Update user (role, ban, verify, action-based, or field-level)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        agentProfile: { select: { id: true, isVerified: true } },
        clubProfile: { select: { id: true, isVerified: true } },
        playerProfile: { select: { id: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    if (action) {
      const { role: newRole, verified } = body
      switch (action) {
        case "changeRole":
          if (!newRole || !["PLAYER", "AGENT", "CLUB", "ADMIN"].includes(newRole)) {
            return NextResponse.json({ error: "Rôle invalide" }, { status: 400 })
          }
          await prisma.user.update({
            where: { id },
            data: { role: newRole as Role },
          })
          break

        case "verifyAgent":
          if (user.role !== "AGENT" || !user.agentProfile) {
            return NextResponse.json({ error: "Utilisateur n'est pas un agent" }, { status: 400 })
          }
          await prisma.agentProfile.update({
            where: { id: user.agentProfile.id },
            data: { isVerified: verified ?? true },
          })
          break

        case "verifyClub":
          if (user.role !== "CLUB" || !user.clubProfile) {
            return NextResponse.json({ error: "Utilisateur n'est pas un club" }, { status: 400 })
          }
          await prisma.clubProfile.update({
            where: { id: user.clubProfile.id },
            data: { isVerified: verified ?? true },
          })
          break

        case "verifyEmail": {
          const emailVerified = body.verified === true ? new Date() : null
          await prisma.user.update({
            where: { id },
            data: { emailVerified },
          })
          break
        }

        case "creditWallet": {
          const { walletType, amount: creditAmount, description: creditDesc } = body
          if (!walletType || !["SUBSCRIPTION", "PURCHASED", "EARNED", "BONUS"].includes(walletType)) {
            return NextResponse.json({ error: "Type de wallet invalide" }, { status: 400 })
          }
          if (!creditAmount || creditAmount <= 0) {
            return NextResponse.json({ error: "Montant invalide" }, { status: 400 })
          }

          // Upsert wallet
          const wallet = await prisma.wallet.upsert({
            where: { userId_type: { userId: id, type: walletType } },
            create: { userId: id, type: walletType, balance: creditAmount },
            update: { balance: { increment: creditAmount } },
          })

          // Create transaction log
          await prisma.creditTransaction.create({
            data: {
              userId: id,
              walletType,
              type: "CREDIT_BONUS",
              status: "COMPLETED",
              amount: creditAmount,
              balanceBefore: wallet.balance - creditAmount,
              balanceAfter: wallet.balance,
              description: creditDesc || `Credit admin: +${creditAmount} credits (${walletType})`,
              metadata: { adminId: session.user.id, adminAction: true },
            },
          })

          break
        }

        case "debitWallet": {
          const { walletType: debitWalletType, amount: debitAmount, description: debitDesc } = body
          if (!debitWalletType || !["SUBSCRIPTION", "PURCHASED", "EARNED", "BONUS"].includes(debitWalletType)) {
            return NextResponse.json({ error: "Type de wallet invalide" }, { status: 400 })
          }
          if (!debitAmount || debitAmount <= 0) {
            return NextResponse.json({ error: "Montant invalide" }, { status: 400 })
          }

          const debitWallet = await prisma.wallet.findUnique({
            where: { userId_type: { userId: id, type: debitWalletType } },
          })

          if (!debitWallet || debitWallet.balance < debitAmount) {
            return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 })
          }

          const updatedWallet = await prisma.wallet.update({
            where: { userId_type: { userId: id, type: debitWalletType } },
            data: { balance: { decrement: debitAmount } },
          })

          await prisma.creditTransaction.create({
            data: {
              userId: id,
              walletType: debitWalletType,
              type: "REFUND",
              status: "COMPLETED",
              amount: debitAmount,
              balanceBefore: updatedWallet.balance + debitAmount,
              balanceAfter: updatedWallet.balance,
              description: debitDesc || `Debit admin: -${debitAmount} credits (${debitWalletType})`,
              metadata: { adminId: session.user.id, adminAction: true },
            },
          })

          break
        }

        case "suspend":
        case "reactivate":
        case "resetPassword":
        case "forceLogout":
          break

        default:
          return NextResponse.json({ error: "Action invalide" }, { status: 400 })
      }

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: `ADMIN_${action.toUpperCase()}`,
          targetType: "USER",
          targetId: id,
          metadata: body,
        },
      })

      return NextResponse.json({ success: true })
    }

    const { name, role, playerProfile, agentProfile, clubProfile } = body

    const userUpdate: Record<string, any> = {}
    if (name !== undefined) userUpdate.name = name
    if (role !== undefined && ["PLAYER", "AGENT", "CLUB", "ADMIN"].includes(role)) {
      userUpdate.role = role as Role
    }

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where: { id }, data: userUpdate })
    }

    if (playerProfile && user.playerProfile) {
      const ppUpdate: Record<string, any> = {}
      const allowedFields = [
        "firstName", "lastName", "primaryPosition",
        "currentClub", "nationality", "bio",
      ]
      for (const field of allowedFields) {
        if (playerProfile[field] !== undefined) {
          ppUpdate[field] = playerProfile[field]
        }
      }
      if (playerProfile.dateOfBirth !== undefined) {
        ppUpdate.dateOfBirth = new Date(playerProfile.dateOfBirth)
      }
      if (Object.keys(ppUpdate).length > 0) {
        await prisma.playerProfile.update({
          where: { id: user.playerProfile.id },
          data: ppUpdate,
        })
      }
    }

    if (agentProfile && user.agentProfile) {
      const apUpdate: Record<string, any> = {}
      const allowedFields = [
        "firstName", "lastName", "agencyName",
        "licenseNumber", "licenseCountry",
      ]
      for (const field of allowedFields) {
        if (agentProfile[field] !== undefined) {
          apUpdate[field] = agentProfile[field]
        }
      }
      if (Object.keys(apUpdate).length > 0) {
        await prisma.agentProfile.update({
          where: { id: user.agentProfile.id },
          data: apUpdate,
        })
      }
    }

    if (clubProfile && user.clubProfile) {
      const cpUpdate: Record<string, any> = {}
      const allowedFields = ["clubName", "country", "league"]
      for (const field of allowedFields) {
        if (clubProfile[field] !== undefined) {
          cpUpdate[field] = clubProfile[field]
        }
      }
      if (Object.keys(cpUpdate).length > 0) {
        await prisma.clubProfile.update({
          where: { id: user.clubProfile.id },
          data: cpUpdate,
        })
      }
    }

    // Career entries management
    const { careerEntries } = body
    if (careerEntries && user.playerProfile) {
      for (const entry of careerEntries) {
        if (entry._delete && entry.id) {
          // Delete career entry
          await prisma.careerEntry.delete({
            where: { id: entry.id },
          })
        } else if (entry.id) {
          // Update existing career entry
          const { id: entryId, _delete, ...updateData } = entry
          if (updateData.startDate) updateData.startDate = new Date(updateData.startDate)
          if (updateData.endDate) updateData.endDate = new Date(updateData.endDate)
          await prisma.careerEntry.update({
            where: { id: entryId },
            data: updateData,
          })
        } else {
          // Create new career entry
          const { _delete, ...createData } = entry
          if (createData.startDate) createData.startDate = new Date(createData.startDate)
          if (createData.endDate) createData.endDate = new Date(createData.endDate)
          await prisma.careerEntry.create({
            data: {
              ...createData,
              playerProfileId: user.playerProfile.id,
            },
          })
        }
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ADMIN_UPDATE_USER_FIELDS",
        targetType: "USER",
        targetId: id,
        metadata: body,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Delete user (cascade will handle related data)
    await prisma.user.delete({ where: { id } })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ADMIN_DELETE_USER",
        targetType: "USER",
        targetId: id,
        metadata: { deletedEmail: user.email },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    )
  }
}
