// Seed script pour données de démonstration
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Début du seeding...")

  // Clear existing data (optionnel, attention en production!)
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.like.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.reportSection.deleteMany()
  await prisma.playerReport.deleteMany()
  await prisma.application.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.mandate.deleteMany()
  await prisma.careerEntry.deleteMany()
  await prisma.fileAsset.deleteMany()
  await prisma.staffMember.deleteMany()
  await prisma.team.deleteMany()
  await prisma.playerProfile.deleteMany()
  await prisma.agentProfile.deleteMany()
  await prisma.clubProfile.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash("password123", 10)

  // 1. Créer un joueur
  console.log("Création joueur...")
  const playerUser = await prisma.user.create({
    data: {
      email: "player@profoot.com",
      password: hashedPassword,
      role: "PLAYER",
      playerProfile: {
        create: {
          firstName: "Kylian",
          lastName: "Dupont",
          displayName: "K. Dupont",
          dateOfBirth: new Date("1998-12-20"),
          nationality: "France",
          height: 178,
          weight: 73,
          strongFoot: "RIGHT",
          primaryPosition: "FW",
          secondaryPositions: ["MF"],
          currentClub: "Paris FC",
          currentLeague: "Ligue 2",
          bio: "Attaquant rapide et technique, à la recherche de nouvelles opportunités.",
          isPublic: true,
          isSearchable: true,
          availableFrom: new Date("2026-06-01"),
          statistics: {
            "2025/26": { appearances: 25, goals: 12, assists: 7 },
            "2024/25": { appearances: 30, goals: 15, assists: 10 },
          },
        }
      }
    },
    include: { playerProfile: true }
  })

  // Ajouter parcours joueur
  await prisma.careerEntry.createMany({
    data: [
      {
        playerProfileId: playerUser.playerProfile!.id,
        clubName: "Paris FC",
        league: "Ligue 2",
        country: "France",
        season: "2025/26",
        startDate: new Date("2025-07-01"),
        position: "FW",
        appearances: 25,
        minutesPlayed: 2000,
        goals: 12,
        assists: 7,
      },
      {
        playerProfileId: playerUser.playerProfile!.id,
        clubName: "FC Chambly",
        league: "National",
        country: "France",
        season: "2024/25",
        startDate: new Date("2024-07-01"),
        endDate: new Date("2025-06-30"),
        position: "FW",
        appearances: 30,
        minutesPlayed: 2500,
        goals: 15,
        assists: 10,
      }
    ]
  })

  // 2. Créer un agent
  console.log("Création agent...")
  const agentUser = await prisma.user.create({
    data: {
      email: "agent@profoot.com",
      password: hashedPassword,
      role: "AGENT",
      agentProfile: {
        create: {
          firstName: "Sophie",
          lastName: "Martin",
          agencyName: "SM Sports Management",
          licenseNumber: "FRA-2024-1234",
          licenseCountry: "France",
          bio: "Agent FIFA spécialisée dans les jeunes talents français.",
          specialties: ["Forwards", "French Players", "Youth Development"],
          phoneNumber: "+33 6 12 34 56 78",
          isVerified: true,
        }
      }
    },
    include: { agentProfile: true }
  })

  // 3. Créer un club
  console.log("Création club...")
  const clubUser = await prisma.user.create({
    data: {
      email: "club@profoot.com",
      password: hashedPassword,
      role: "CLUB",
      clubProfile: {
        create: {
          clubName: "Olympique Niçois",
          shortName: "ON",
          country: "France",
          city: "Nice",
          league: "Ligue 1",
          division: "1",
          bio: "Club ambitieux cherchant à renforcer son effectif.",
          foundedYear: 1904,
          isVerified: true,
        }
      }
    },
    include: { clubProfile: true }
  })

  // Créer équipes club
  const firstTeam = await prisma.team.create({
    data: {
      clubProfileId: clubUser.clubProfile!.id,
      name: "Équipe Première",
      level: "PRO",
    }
  })

  await prisma.staffMember.createMany({
    data: [
      {
        teamId: firstTeam.id,
        name: "Jean Dupuis",
        role: "Head Coach",
        email: "coach@on.com",
      },
      {
        teamId: firstTeam.id,
        name: "Marc Leblanc",
        role: "Scout",
        email: "scout@on.com",
      }
    ]
  })

  // 4. Créer un mandat (agent-joueur)
  console.log("Création mandat...")
  const mandate = await prisma.mandate.create({
    data: {
      agentProfileId: agentUser.agentProfile!.id,
      playerProfileId: playerUser.playerProfile!.id,
      status: "ACTIVE",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2028-12-31"),
      terms: "Commission: 10% du salaire brut. Durée: 3 ans.",
      acceptedAt: new Date(),
    }
  })

  // 5. Créer une annonce club
  console.log("Création annonce...")
  const listing = await prisma.listing.create({
    data: {
      clubProfileId: clubUser.clubProfile!.id,
      title: "Attaquant de pointe - Ligue 1",
      description: "Nous recherchons un attaquant rapide et technique pour renforcer notre ligne offensive.",
      position: "FW",
      minAge: 20,
      maxAge: 28,
      nationality: ["France", "Belgium", "Italy"],
      salaryMin: 50000,
      salaryMax: 100000,
      currency: "EUR",
      contractType: "Permanent",
      startDate: new Date("2026-07-01"),
      requirements: "Expérience en Ligue 1 ou Ligue 2. Minimum 10 buts par saison.",
      status: "PUBLISHED",
      publishedAt: new Date(),
    }
  })

  // 6. Créer une candidature
  console.log("Création candidature...")
  const application = await prisma.application.create({
    data: {
      playerProfileId: playerUser.playerProfile!.id,
      listingId: listing.id,
      clubProfileId: clubUser.clubProfile!.id,
      status: "SUBMITTED",
      coverLetter: "Bonjour, je suis très intéressé par ce poste et pense correspondre au profil recherché.",
    }
  })

  // 7. Créer des posts
  console.log("Création posts...")
  await prisma.post.createMany({
    data: [
      {
        userId: playerUser.id,
        content: "Excellente session d'entraînement aujourd'hui ! 💪⚽",
        mediaUrls: [],
      },
      {
        userId: agentUser.id,
        content: "Fier d'accompagner de jeunes talents vers le professionnalisme. 🌟",
        mediaUrls: [],
      },
      {
        userId: clubUser.id,
        content: "Nous recrutons ! Consultez nos annonces sur Profoot Profile.",
        mediaUrls: [],
      }
    ]
  })

  // 8. Créer notifications
  console.log("Création notifications...")
  await prisma.notification.createMany({
    data: [
      {
        userId: playerUser.id,
        type: "MANDATE_ACCEPTED",
        title: "Mandat accepté",
        message: "Votre mandat avec Sophie Martin a été activé.",
        link: `/player/agents`,
      },
      {
        userId: clubUser.id,
        type: "APPLICATION_RECEIVED",
        title: "Nouvelle candidature",
        message: "Kylian Dupont a postulé à votre annonce.",
        link: `/club/applications/${application.id}`,
      },
      {
        userId: agentUser.id,
        type: "MANDATE_ACCEPTED",
        title: "Mandat activé",
        message: "Kylian Dupont a accepté votre mandat.",
        link: `/agent/players`,
      }
    ]
  })

  // 9. Créer un rapport joueur
  console.log("Création rapport...")
  await prisma.playerReport.create({
    data: {
      subjectId: playerUser.playerProfile!.id,
      authorId: playerUser.playerProfile!.id,
      authorType: "PLAYER",
      title: "Rapport de saison 2025/26",
      version: 1,
      status: "APPROVED",
      sections: {
        create: [
          {
            order: 1,
            title: "Performance",
            content: "Excellente saison avec 12 buts et 7 passes décisives en 25 matchs.",
          },
          {
            order: 2,
            title: "Points forts",
            content: "Vitesse, dribble, finition. Bon dans les espaces.",
          },
          {
            order: 3,
            title: "Axes d'amélioration",
            content: "Jeu de tête, vision de jeu collective.",
          }
        ]
      },
      approvedAt: new Date(),
    }
  })

  // 10. Créer joueurs supplémentaires
  console.log("Création joueurs supplémentaires...")
  const player2 = await prisma.user.create({
    data: {
      email: "player2@profoot.com",
      password: hashedPassword,
      role: "PLAYER",
      playerProfile: {
        create: {
          firstName: "Thomas",
          lastName: "Bernard",
          dateOfBirth: new Date("2000-05-15"),
          nationality: "France",
          height: 182,
          weight: 78,
          primaryPosition: "MF",
          secondaryPositions: ["DF"],
          currentClub: "Grenoble Foot",
          currentLeague: "Ligue 2",
          isPublic: true,
          isSearchable: true,
        }
      }
    },
    include: { playerProfile: true }
  })

  const player3 = await prisma.user.create({
    data: {
      email: "player3@profoot.com",
      password: hashedPassword,
      role: "PLAYER",
      playerProfile: {
        create: {
          firstName: "Amadou",
          lastName: "Diallo",
          dateOfBirth: new Date("1999-03-10"),
          nationality: "Sénégal",
          secondNationality: "France",
          height: 185,
          weight: 80,
          primaryPosition: "DF",
          currentClub: "Free Agent",
          isPublic: true,
          isSearchable: true,
          availableFrom: new Date("2026-02-01"),
        }
      }
    },
    include: { playerProfile: true }
  })

  // 11. Créer clubs supplémentaires
  console.log("Création clubs supplémentaires...")
  const club2 = await prisma.user.create({
    data: {
      email: "club2@profoot.com",
      password: hashedPassword,
      role: "CLUB",
      clubProfile: {
        create: {
          clubName: "FC Sochaux",
          shortName: "FCSM",
          country: "France",
          city: "Sochaux",
          league: "Ligue 2",
          division: "2",
          foundedYear: 1928,
          isVerified: true,
        }
      }
    },
    include: { clubProfile: true }
  })

  // 12. Créer annonces supplémentaires
  console.log("Création annonces supplémentaires...")
  await prisma.listing.createMany({
    data: [
      {
        clubProfileId: club2.clubProfile!.id,
        title: "Défenseur central expérimenté",
        description: "Recherche défenseur solide pour renforcer la charnière centrale.",
        position: "DF",
        minAge: 23,
        maxAge: 30,
        nationality: ["France", "Senegal", "Ivory Coast"],
        salaryMin: 40000,
        salaryMax: 80000,
        currency: "EUR",
        contractType: "Permanent",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      {
        clubProfileId: clubUser.clubProfile!.id,
        title: "Milieu créatif",
        description: "Recherche milieu offensif avec bonne vision de jeu.",
        position: "MF",
        minAge: 20,
        maxAge: 27,
        nationality: [],
        status: "DRAFT",
      }
    ]
  })

  // 13. Créer likes et comments
  console.log("Création interactions sociales...")
  const posts = await prisma.post.findMany({ take: 2 })
  
  if (posts.length > 0) {
    await prisma.like.create({
      data: {
        postId: posts[0].id,
        userId: agentUser.id,
      }
    })

    await prisma.comment.create({
      data: {
        postId: posts[0].id,
        userId: clubUser.id,
        content: "Excellente performance ! 👏",
      }
    })
  }

  console.log("✅ Seeding terminé!")
  console.log("\n📧 Comptes créés:")
  console.log("Joueur 1: player@profoot.com / password123")
  console.log("Joueur 2: player2@profoot.com / password123")
  console.log("Joueur 3: player3@profoot.com / password123")
  console.log("Agent: agent@profoot.com / password123")
  console.log("Club 1: club@profoot.com / password123")
  console.log("Club 2: club2@profoot.com / password123")
  console.log("\n📊 Données créées:")
  console.log("- 3 joueurs avec profils complets")
  console.log("- 1 agent vérifié")
  console.log("- 2 clubs vérifiés")
  console.log("- 3 annonces (2 publiées, 1 brouillon)")
  console.log("- 1 mandat actif")
  console.log("- 1 candidature")
  console.log("- 1 rapport joueur")
  console.log("- 3 posts")
  console.log("- Interactions sociales")
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
