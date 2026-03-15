// Script de nettoyage : supprime les faux comptes créés par le seed de démo
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Emails des comptes de démo à supprimer
const SEED_EMAILS = [
  "player@profoot.com",
  "player2@profoot.com",
  "player3@profoot.com",
  "agent@profoot.com",
  "club@profoot.com",
  "club2@profoot.com",
]

async function main() {
  console.log("🧹 Nettoyage des données de démo...")

  const seedUsers = await prisma.user.findMany({
    where: { email: { in: SEED_EMAILS } },
    select: { id: true, email: true },
  })

  if (seedUsers.length === 0) {
    console.log("✅ Aucune donnée de démo trouvée en base.")
    return
  }

  console.log(`Comptes trouvés : ${seedUsers.map((u) => u.email).join(", ")}`)

  const userIds = seedUsers.map((u) => u.id)

  // Supprimer dans l'ordre des dépendances
  await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.like.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.comment.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.post.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.follow.deleteMany({
    where: { OR: [{ followerId: { in: userIds } }, { followingId: { in: userIds } }] },
  })

  // Reports liés aux joueurs de démo
  const playerProfiles = await prisma.playerProfile.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  })
  const playerProfileIds = playerProfiles.map((p) => p.id)

  const reports = await prisma.playerReport.findMany({
    where: {
      OR: [
        { subjectId: { in: playerProfileIds } },
        { authorId: { in: playerProfileIds } },
      ],
    },
    select: { id: true },
  })
  const reportIds = reports.map((r) => r.id)

  await prisma.reportSection.deleteMany({ where: { reportId: { in: reportIds } } })
  await prisma.playerReport.deleteMany({ where: { id: { in: reportIds } } })

  // Récupérer les agentProfiles pour les soumissions et mandats
  const agentProfiles = await prisma.agentProfile.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  })
  const agentProfileIds = agentProfiles.map((a) => a.id)

  // Applications liées aux joueurs de démo
  await prisma.application.deleteMany({ where: { playerProfileId: { in: playerProfileIds } } })
  await prisma.submission.deleteMany({ where: { agentProfileId: { in: agentProfileIds } } })

  // Listings des clubs de démo
  const clubProfiles = await prisma.clubProfile.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  })
  const clubProfileIds = clubProfiles.map((c) => c.id)

  const listings = await prisma.listing.findMany({
    where: { clubProfileId: { in: clubProfileIds } },
    select: { id: true },
  })
  const listingIds = listings.map((l) => l.id)

  await prisma.application.deleteMany({ where: { listingId: { in: listingIds } } })
  await prisma.listing.deleteMany({ where: { id: { in: listingIds } } })

  await prisma.mandate.deleteMany({
    where: {
      OR: [
        { playerProfileId: { in: playerProfileIds } },
        { agentProfileId: { in: agentProfileIds } },
      ],
    },
  })

  await prisma.careerEntry.deleteMany({ where: { playerProfileId: { in: playerProfileIds } } })
  await prisma.fileAsset.deleteMany({ where: { ownerId: { in: userIds } } })

  // StaffMembers liés aux équipes des clubs de démo
  const teams = await prisma.team.findMany({
    where: { clubProfileId: { in: clubProfileIds } },
    select: { id: true },
  })
  const teamIds = teams.map((t) => t.id)
  await prisma.staffMember.deleteMany({ where: { teamId: { in: teamIds } } })
  await prisma.team.deleteMany({ where: { clubProfileId: { in: clubProfileIds } } })

  await prisma.playerProfile.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.agentProfile.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.clubProfile.deleteMany({ where: { userId: { in: userIds } } })

  await prisma.account.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } })

  await prisma.user.deleteMany({ where: { id: { in: userIds } } })

  console.log(`✅ ${seedUsers.length} compte(s) de démo supprimé(s) avec succès.`)
}

main()
  .catch((e) => {
    console.error("Erreur :", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
