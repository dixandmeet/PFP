// AI Tools pour Agent
import { z } from "zod"
import { AITool } from "./player-tools"
import { prisma } from "@/lib/prisma"

export const agentTools: AITool[] = [
  {
    name: "shortlist_players",
    description: "Générer une shortlist de joueurs selon des critères",
    parameters: z.object({
      position: z.string().describe("Position recherchée"),
      minAge: z.number().int().optional(),
      maxAge: z.number().int().optional(),
      nationality: z.string().optional(),
      limit: z.number().int().min(1).max(20).default(10),
    }),
    execute: async (params, context) => {
      const where: any = {
        isSearchable: true,
      }

      if (params.position) {
        where.OR = [
          { primaryPosition: { contains: params.position, mode: "insensitive" } },
          { secondaryPositions: { has: params.position } },
        ]
      }

      if (params.nationality) {
        where.nationality = params.nationality
      }

      const players = await prisma.playerProfile.findMany({
        where,
        take: params.limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          nationality: true,
          primaryPosition: true,
          currentClub: true,
          availableFrom: true,
        }
      })

      return {
        success: true,
        players: players.map(p => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
          position: p.primaryPosition,
          nationality: p.nationality,
          club: p.currentClub,
        })),
        message: `${players.length} joueur(s) trouvé(s)`,
      }
    }
  },

  {
    name: "submit_to_club",
    description: "Soumettre un joueur sous mandat à un club",
    parameters: z.object({
      playerProfileId: z.string().cuid(),
      clubProfileId: z.string().cuid(),
      message: z.string().optional().describe("Message personnalisé pour le club"),
      listingId: z.string().cuid().optional().describe("ID d'une annonce spécifique (optionnel)"),
    }),
    execute: async (params, context) => {
      // Vérifier que l'agent a un profil
      const agentProfile = await prisma.agentProfile.findUnique({
        where: { userId: context.userId }
      })

      if (!agentProfile) {
        throw new Error("Profil agent requis")
      }

      // Vérifier mandat actif
      const mandate = await prisma.mandate.findFirst({
        where: {
          agentProfileId: agentProfile.id,
          playerProfileId: params.playerProfileId,
          status: "ACTIVE",
          endDate: { gte: new Date() },
        }
      })

      if (!mandate) {
        throw new Error("Aucun mandat actif pour ce joueur")
      }

      // Récupérer les infos du joueur
      const playerProfile = await prisma.playerProfile.findUnique({
        where: { id: params.playerProfileId }
      })

      if (!playerProfile) {
        throw new Error("Joueur non trouvé")
      }

      // Créer la soumission
      const submission = await prisma.submission.create({
        data: {
          agentProfileId: agentProfile.id,
          playerProfileId: params.playerProfileId,
          clubProfileId: params.clubProfileId,
          listingId: params.listingId,
          message: params.message,
          playerData: {
            firstName: playerProfile.firstName,
            lastName: playerProfile.lastName,
            position: playerProfile.primaryPosition,
            nationality: playerProfile.nationality,
          },
          reportIds: [],
          attachments: [],
          status: "SUBMITTED",
        },
        include: {
          clubProfile: {
            select: {
              clubName: true,
              userId: true,
            }
          }
        }
      })

      // Notification au club
      await prisma.notification.create({
        data: {
          userId: submission.clubProfile.userId,
          type: "SUBMISSION_RECEIVED",
          title: "Nouvelle soumission d'agent",
          message: `${agentProfile.firstName} ${agentProfile.lastName} vous propose ${playerProfile.firstName} ${playerProfile.lastName}`,
          link: `/club/applications/${submission.id}`,
        }
      })

      return {
        success: true,
        submissionId: submission.id,
        targetType: "SUBMISSION",
        targetId: submission.id,
        message: `Joueur soumis à ${submission.clubProfile.clubName}`,
      }
    }
  },

  {
    name: "search_opportunities",
    description: "Trouver des annonces de clubs et opportunités pour les joueurs sous mandat",
    parameters: z.object({
      position: z.string().optional(),
      limit: z.number().int().min(1).max(20).default(10),
    }),
    execute: async (params, context) => {
      const where: any = {
        status: "PUBLISHED",
      }

      if (params.position) {
        where.position = { contains: params.position, mode: "insensitive" }
      }

      const listings = await prisma.listing.findMany({
        where,
        take: params.limit,
        include: {
          clubProfile: {
            select: {
              clubName: true,
              country: true,
              league: true,
            }
          }
        },
        orderBy: { publishedAt: "desc" }
      })

      return {
        success: true,
        opportunities: listings.map(l => ({
          id: l.id,
          title: l.title,
          club: l.clubProfile.clubName,
          position: l.position,
          salary: l.salaryMin && l.salaryMax 
            ? `${l.salaryMin}-${l.salaryMax} ${l.currency}`
            : "N/A",
        })),
        message: `${listings.length} opportunité(s) trouvée(s)`,
      }
    }
  },
]
