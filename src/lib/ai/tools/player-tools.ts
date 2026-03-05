// AI Tools pour Player
import { z } from "zod"
import { prisma } from "@/lib/prisma"

export interface ToolContext {
  userId: string
  role: string
  prisma: typeof prisma
}

export interface AITool {
  name: string
  description: string
  parameters: z.ZodType<any>
  execute: (params: any, context: ToolContext) => Promise<any>
}

export const playerTools: AITool[] = [
  {
    name: "improve_profile",
    description: "Analyse le profil du joueur et suggère des améliorations (bio, stats manquantes, parcours)",
    parameters: z.object({
      suggestions: z.array(z.string()).describe("Liste de suggestions d'amélioration"),
    }),
    execute: async (params, context) => {
      // Outil informatif, pas d'action
      return {
        success: true,
        suggestions: params.suggestions,
        message: "Suggestions de profil générées",
      }
    }
  },
  
  {
    name: "generate_post",
    description: "Génère un post pour le feed social",
    parameters: z.object({
      content: z.string().min(1).max(5000).describe("Contenu du post à publier"),
    }),
    execute: async (params, context) => {
      const post = await prisma.post.create({
        data: {
          userId: context.userId,
          content: params.content,
          mediaUrls: [],
        }
      })

      return {
        success: true,
        postId: post.id,
        targetType: "POST",
        targetId: post.id,
        message: `Post publié avec succès`,
      }
    }
  },

  {
    name: "apply_to_listing",
    description: "Postuler à une annonce de club",
    parameters: z.object({
      listingId: z.string().cuid().describe("ID de l'annonce"),
      coverLetter: z.string().optional().describe("Lettre de motivation personnalisée"),
    }),
    execute: async (params, context) => {
      // Récupérer le profil joueur
      const playerProfile = await prisma.playerProfile.findUnique({
        where: { userId: context.userId }
      })

      if (!playerProfile) {
        throw new Error("Profil joueur non trouvé")
      }

      // Vérifier l'annonce
      const listing = await prisma.listing.findUnique({
        where: { id: params.listingId },
        include: { clubProfile: { select: { userId: true } } }
      })

      if (!listing || listing.status !== "PUBLISHED") {
        throw new Error("Annonce non disponible")
      }

      // Vérifier si déjà postulé
      const existing = await prisma.application.findUnique({
        where: {
          playerProfileId_listingId: {
            playerProfileId: playerProfile.id,
            listingId: params.listingId,
          }
        }
      })

      if (existing) {
        throw new Error("Vous avez déjà postulé à cette annonce")
      }

      // Créer la candidature
      const application = await prisma.application.create({
        data: {
          playerProfileId: playerProfile.id,
          listingId: params.listingId,
          clubProfileId: listing.clubProfileId,
          coverLetter: params.coverLetter,
          status: "SUBMITTED",
        },
        include: {
          listing: {
            select: { title: true }
          },
          clubProfile: {
            select: { clubName: true }
          }
        }
      })

      // Notification
      await prisma.notification.create({
        data: {
          userId: listing.clubProfile.userId,
          type: "APPLICATION_RECEIVED",
          title: "Nouvelle candidature",
          message: `${playerProfile.firstName} ${playerProfile.lastName} a postulé`,
          link: `/club/applications/${application.id}`,
        }
      })

      return {
        success: true,
        applicationId: application.id,
        targetType: "APPLICATION",
        targetId: application.id,
        message: `Candidature envoyée à ${application.clubProfile.clubName}`,
      }
    }
  },

  {
    name: "search_listings",
    description: "Rechercher des annonces de clubs correspondant au profil du joueur",
    parameters: z.object({
      position: z.string().optional().describe("Position recherchée"),
      limit: z.number().int().min(1).max(20).default(10).describe("Nombre max de résultats"),
    }),
    execute: async (params, context) => {
      const playerProfile = await prisma.playerProfile.findUnique({
        where: { userId: context.userId }
      })

      const where: any = {
        status: "PUBLISHED",
      }

      if (params.position) {
        where.position = { contains: params.position, mode: "insensitive" }
      } else if (playerProfile) {
        // Utiliser la position du joueur
        where.position = { contains: playerProfile.primaryPosition, mode: "insensitive" }
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
        listings: listings.map(l => ({
          id: l.id,
          title: l.title,
          club: l.clubProfile.clubName,
          position: l.position,
          country: l.clubProfile.country,
        })),
        message: `${listings.length} annonce(s) trouvée(s)`,
      }
    }
  },
]
