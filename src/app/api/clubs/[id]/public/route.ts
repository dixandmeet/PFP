// GET /api/clubs/[id]/public - Données publiques du club (sans authentification)
// Le paramètre [id] peut être un ID de base de données ou un slug (ex: paris-saint-germain)
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { 
  getTeamData,
  getMockMatches, 
  getMockSquad,
  generateClubSlug,
} from "@/lib/services/thesportsdb"
import { 
  THESPORTSDB_TEAM_IDS,
  getDemoClubInfo 
} from "@/lib/constants/thesportsdb-mapping"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Vérifier d'abord si c'est un slug de club de démonstration
    const demoClubInfo = getDemoClubInfo(id)
    const isKnownSlug = THESPORTSDB_TEAM_IDS[id] !== undefined
    
    if (demoClubInfo || isKnownSlug) {
      // Essayer de récupérer les données réelles depuis TheSportsDB
      const thesportsdbData = await getTeamData(id)
      
      if (thesportsdbData?.team) {
        // Données réelles de TheSportsDB
        const { team, players, lastResults, upcomingMatches } = thesportsdbData
        
        return NextResponse.json({
          club: {
            id: id,
            clubName: team.name,
            shortName: team.shortName,
            logo: team.crest,
            coverPhoto: team.banner,
            country: team.country,
            city: null,
            league: team.league,
            division: null,
            bio: team.description || `${team.name} est un club de football évoluant en ${team.league}.`,
            foundedYear: team.founded || null,
            isVerified: true,
            userId: `demo-${id}`,
            venue: team.venue,
            jersey: team.jersey,
          },
          stats: {
            followers: Math.floor(Math.random() * 10000) + 1000,
            following: Math.floor(Math.random() * 100) + 10,
            posts: Math.floor(Math.random() * 50) + 5,
          },
          teams: [],
          listings: [],
          matches: {
            lastResults: lastResults.length > 0 ? lastResults : getMockMatches(id).lastResults,
            upcomingMatches: upcomingMatches.length > 0 ? upcomingMatches : getMockMatches(id).upcomingMatches,
          },
          squad: players.length > 0 ? players : getMockSquad(id),
          isDemo: true,
          source: "thesportsdb",
        })
      }
      
      // Fallback sur les données mock si TheSportsDB ne répond pas
      if (demoClubInfo) {
        const matchesData = getMockMatches(id)
        const squadData = getMockSquad(id)
        
        return NextResponse.json({
          club: {
            id: id,
            clubName: demoClubInfo.name,
            shortName: demoClubInfo.shortName,
            logo: null,
            coverPhoto: null,
            country: demoClubInfo.country,
            city: null,
            league: demoClubInfo.league,
            division: null,
            bio: `${demoClubInfo.name} est un club de football évoluant en ${demoClubInfo.league}.`,
            foundedYear: null,
            isVerified: true,
            userId: `demo-${id}`,
          },
          stats: {
            followers: Math.floor(Math.random() * 10000) + 1000,
            following: Math.floor(Math.random() * 100) + 10,
            posts: Math.floor(Math.random() * 50) + 5,
          },
          teams: [],
          listings: [],
          matches: matchesData,
          squad: squadData,
          isDemo: true,
          source: "fallback",
        })
      }
    }
    
    // Récupérer le profil du club depuis la base de données
    const clubProfile = await prisma.clubProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            _count: {
              select: {
                followedBy: true,
                following: true,
                posts: true,
              },
            },
          },
        },
        teams: {
          include: {
            staffMembers: true,
          },
        },
        listings: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            position: true,
            publishedAt: true,
            contractType: true,
            salaryMin: true,
            salaryMax: true,
            currency: true,
          },
          orderBy: {
            publishedAt: "desc",
          },
        },
      },
    })

    if (!clubProfile) {
      return NextResponse.json(
        { error: "Club non trouvé" },
        { status: 404 }
      )
    }

    // Essayer de récupérer les données de TheSportsDB pour ce club
    const clubSlug = generateClubSlug(clubProfile.clubName)
    let matchesData = { lastResults: [], upcomingMatches: [] } as { lastResults: any[]; upcomingMatches: any[] }
    let squadData = getMockSquad(clubSlug)
    
    // Tenter de récupérer les données depuis TheSportsDB
    const thesportsdbData = await getTeamData(clubSlug)
    
    if (thesportsdbData) {
      const { players, lastResults, upcomingMatches } = thesportsdbData
      
      if (lastResults.length > 0 || upcomingMatches.length > 0) {
        matchesData = { lastResults, upcomingMatches }
      } else {
        matchesData = getMockMatches(clubSlug)
      }
      
      if (players.length > 0) {
        squadData = players
      }
    } else {
      matchesData = getMockMatches(clubSlug)
    }

    // Formater la réponse
    const response = {
      club: {
        id: clubProfile.id,
        clubName: clubProfile.clubName,
        shortName: clubProfile.shortName,
        logo: clubProfile.logo,
        coverPhoto: clubProfile.coverPhoto,
        country: clubProfile.country,
        city: clubProfile.city,
        league: clubProfile.league,
        division: clubProfile.division,
        bio: clubProfile.bio,
        foundedYear: clubProfile.foundedYear,
        isVerified: clubProfile.isVerified,
        userId: clubProfile.userId,
      },
      stats: {
        followers: clubProfile.user._count.followedBy,
        following: clubProfile.user._count.following,
        posts: clubProfile.user._count.posts,
      },
      teams: clubProfile.teams,
      listings: clubProfile.listings,
      matches: matchesData,
      squad: squadData,
      source: thesportsdbData ? "thesportsdb" : "fallback",
    }

    return NextResponse.json(response)
  } catch (error) {
    return handleApiError(error)
  }
}
