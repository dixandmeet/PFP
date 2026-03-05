// AI Tools pour Club
import { z } from "zod"
import { AITool } from "./player-tools"
import { prisma } from "@/lib/prisma"

export const clubTools: AITool[] = [
  {
    name: "score_applications",
    description: "Scorer les candidatures reçues selon des critères spécifiques",
    parameters: z.object({
      listingId: z.string().cuid().optional(),
      criteria: z.object({
        positionMatch: z.number().min(0).max(10).default(8),
        ageImportance: z.number().min(0).max(10).default(5),
        nationalityImportance: z.number().min(0).max(10).default(3),
      }).optional(),
    }),
    execute: async (params, context) => {
      const clubProfile = await prisma.clubProfile.findUnique({
        where: { userId: context.userId }
      })

      if (!clubProfile) {
        throw new Error("Profil club requis")
      }

      const where: any = {
        clubProfileId: clubProfile.id,
        status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
      }

      if (params.listingId) {
        where.listingId = params.listingId
      }

      const applications = await prisma.application.findMany({
        where,
        include: {
          playerProfile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              primaryPosition: true,
              dateOfBirth: true,
              nationality: true,
            }
          },
          listing: {
            select: {
              position: true,
              minAge: true,
              maxAge: true,
            }
          }
        }
      })

      // Scoring simple
      const scored = applications.map(app => {
        let score = 0
        const age = new Date().getFullYear() - new Date(app.playerProfile.dateOfBirth).getFullYear()

        // Position match
        if (app.playerProfile.primaryPosition.includes(app.listing.position)) {
          score += 30
        }

        // Age range
        if (app.listing.minAge && age >= app.listing.minAge) score += 10
        if (app.listing.maxAge && age <= app.listing.maxAge) score += 10

        return {
          applicationId: app.id,
          playerName: `${app.playerProfile.firstName} ${app.playerProfile.lastName}`,
          score,
          position: app.playerProfile.primaryPosition,
          age,
        }
      })

      scored.sort((a, b) => b.score - a.score)

      return {
        success: true,
        scoredApplications: scored,
        message: `${scored.length} candidature(s) scorée(s)`,
      }
    }
  },

  {
    name: "compare_players",
    description: "Comparer 2 ou plusieurs joueurs (profils, stats, âge, expérience)",
    parameters: z.object({
      playerIds: z.array(z.string().cuid()).min(2).max(5),
    }),
    execute: async (params, context) => {
      const players = await prisma.playerProfile.findMany({
        where: {
          id: { in: params.playerIds },
        },
        include: {
          careerEntries: {
            orderBy: { startDate: "desc" },
            take: 3,
          }
        }
      })

      const comparison = players.map(p => {
        const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()
        return {
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
          age,
          position: p.primaryPosition,
          nationality: p.nationality,
          currentClub: p.currentClub,
          height: p.height,
          weight: p.weight,
          recentClubs: p.careerEntries.map(c => c.clubName),
        }
      })

      return {
        success: true,
        comparison,
        message: `${comparison.length} joueur(s) comparé(s)`,
      }
    }
  },

  {
    name: "search_players",
    description: "Recherche avancée de joueurs selon les besoins du club",
    parameters: z.object({
      position: z.string(),
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
          availableFrom: p.availableFrom,
        })),
        message: `${players.length} joueur(s) trouvé(s)`,
      }
    }
  },
]
