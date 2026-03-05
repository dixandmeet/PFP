/**
 * Script pour importer les commentaires depuis les données Bubble.
 *
 * Usage: npx tsx scripts/seed-comments.ts
 */

import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Données des commentaires
const commentsData = [
  {
    uniqueId: "1750450277862x400866342154272800",
    answer: "",
    comment: "C'est génial 👍 ",
    like: "antoinebadeau@gmail.com",
    createdAt: "Jun 20, 2025 10:11 pm",
    creator: "getbu.kevin@gmail.com",
  },
  {
    uniqueId: "1750485489701x383631353655853060",
    answer: "1750450277862x400866342154272800",
    comment: "Oui ! On ne s'arrête plus maintenant 😉",
    like: "",
    createdAt: "Jun 21, 2025 7:58 am",
    creator: "antoinebadeau@gmail.com",
  },
  {
    uniqueId: "1750937090413x162021288168128500",
    answer: "",
    comment: "https://youtu.be/H8pufISrWR8?si=h-iWiHdbJfd_eqhW",
    like: "",
    createdAt: "Jun 26, 2025 1:24 pm",
    creator: "bissoumabassagnon@gmail.com",
  },
  {
    uniqueId: "1750937158030x594137880895684600",
    answer: "",
    comment: "Ma page tout est bolou olivier tchena",
    like: "",
    createdAt: "Jun 26, 2025 1:25 pm",
    creator: "bissoumabassagnon@gmail.com",
  },
  {
    uniqueId: "1751569066360x177457950208294900",
    answer: "",
    comment: "Comment obtenir cette opportunité ? ",
    like: "",
    createdAt: "Jul 3, 2025 8:57 pm",
    creator: "devson2007@gmail.com",
  },
  {
    uniqueId: "1759156567623x398714527317753860",
    answer: "",
    comment: "Amirmekni90@gmail.com",
    like: "",
    createdAt: "Sep 29, 2025 4:36 pm",
    creator: "amirmekni90@gmail.com",
  },
  {
    uniqueId: "1759159047225x628245375808962600",
    answer: "",
    comment: "Amirmekni90@gmail.com",
    like: "",
    createdAt: "Sep 29, 2025 5:17 pm",
    creator: "amirmekni90@gmail.com",
  },
  {
    uniqueId: "1763389204027x617479984433332200",
    answer: "",
    comment: "👍🏼",
    like: "",
    createdAt: "Nov 17, 2025 3:20 pm",
    creator: "clem.hayere@hotmail.fr",
  },
]

// Mapping commentaire → post (basé sur l'analyse des dates et contextes)
// Posts existants avec leurs IDs Bubble :
const POST_MAPPING: Record<string, string> = {
  // Post: "Nouvelles Annonces de Clubs en approche ce weekend !" par antoinebadeau (Jun 20)
  "post_bubble_1750441000760": "antoinebadeau_jun20",
  // Post: "NOUVELLES ANNONCES DISPONIBLES" par clem.hayere (Jun 22)
  "post_bubble_1750619120403": "clem_jun22",
  // Post: "Je suis un milieu de terrain..." par bissoumabassagnon (Jun 26)
  "post_bubble_1750936966292": "bissouma_jun26",
  // Post: "Je créé la chance..." par amirmekni90 (Sep 29)
  "post_bubble_1759152770606": "amir_sep29_1",
  // Post: "Jai 21 ans..." par amirmekni90 (Sep 29)
  "post_bubble_1759161250457": "amir_sep29_2",
  // Post: "Salut ! Je suis Bangoura..." par fodemomobangoura0 (Nov 21)
  "post_bubble_1763686050998": "fode_nov21",
  // Post: "Le lien pour mes vidéos" par fodemomobangoura0 (Nov 25)
  "post_bubble_1764030751754": "fode_nov25",
  // Post: recrutement jusicagent (Sep 29)
  "post_bubble_1759141444660": "jusic_sep29",
}

function parseDate(dateStr: string): Date {
  // Format: "Jun 20, 2025 10:11 pm"
  return new Date(dateStr)
}

async function findPostForComment(
  commentDate: Date,
  creatorEmail: string,
): Promise<string | null> {
  // Stratégie : trouver le post le plus récent AVANT la date du commentaire
  const posts = await prisma.$queryRaw<Array<{ id: string; userId: string; createdAt: Date }>>`
    SELECT p."id", p."userId", p."createdAt"
    FROM "Post" p
    WHERE p."createdAt" <= ${commentDate}
    ORDER BY p."createdAt" DESC
    LIMIT 5
  `

  if (posts.length === 0) return null

  // Retourner le post le plus récent avant le commentaire
  return posts[0].id
}

async function main() {
  console.log("💬 Début de l'import des commentaires...\n")

  let created = 0
  let skippedNoUser = 0
  let skippedNoPost = 0
  let errors = 0
  const likesToCreate: Array<{ postId: string; userEmail: string }> = []

  // Mapping uniqueId → postId pour les réponses
  const commentPostMap = new Map<string, string>()

  for (const entry of commentsData) {
    try {
      // Trouver l'utilisateur créateur
      const users = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "User" WHERE LOWER("email") = ${entry.creator.toLowerCase()} LIMIT 1
      `
      const creator = users[0]

      if (!creator) {
        console.log(`  ⚠️  Utilisateur non trouvé: ${entry.creator}`)
        skippedNoUser++
        continue
      }

      const commentDate = parseDate(entry.createdAt)

      // Déterminer le postId
      let postId: string | null = null

      if (entry.answer) {
        // C'est une réponse à un autre commentaire → même post
        postId = commentPostMap.get(entry.answer) || null
        if (!postId) {
          console.log(`  ⚠️  Commentaire parent non trouvé pour réponse: ${entry.uniqueId}`)
        }
      }

      if (!postId) {
        // Trouver le post le plus approprié
        postId = await findPostForComment(commentDate, entry.creator)
      }

      if (!postId) {
        console.log(`  ⚠️  Aucun post trouvé pour le commentaire de ${entry.creator} (${entry.createdAt})`)
        skippedNoPost++
        continue
      }

      // Stocker le mapping pour les réponses futures
      commentPostMap.set(entry.uniqueId, postId)

      // Vérifier si le commentaire existe déjà (par contenu + userId + date approximative)
      const existing = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Comment"
        WHERE "userId" = ${creator.id}
        AND "postId" = ${postId}
        AND "content" = ${entry.comment}
        LIMIT 1
      `

      if (existing.length > 0) {
        console.log(`  ⏭️  Commentaire déjà existant: "${entry.comment.substring(0, 40)}..." par ${entry.creator}`)
        continue
      }

      // Créer le commentaire
      const commentId = `comment_bubble_${entry.uniqueId.substring(0, 13)}`
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Comment" ("id", "postId", "userId", "content", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        commentId,
        postId,
        creator.id,
        entry.comment,
        commentDate,
        commentDate,
      )

      // Récupérer le titre du post pour le log
      const postInfo = await prisma.$queryRaw<Array<{ content: string }>>`
        SELECT SUBSTRING("content", 1, 50) as "content" FROM "Post" WHERE "id" = ${postId} LIMIT 1
      `
      const postPreview = postInfo[0]?.content || "?"

      console.log(
        `  ✅ ${entry.creator} → "${entry.comment.substring(0, 40)}${entry.comment.length > 40 ? "..." : ""}" sur "${postPreview}..."`
      )
      created++

      // Gérer les likes sur le commentaire (Like dans les données = like sur le post)
      if (entry.like) {
        likesToCreate.push({ postId, userEmail: entry.like })
      }
    } catch (err) {
      console.error(`  ❌ Erreur pour ${entry.creator}:`, err)
      errors++
    }
  }

  // Créer les likes
  if (likesToCreate.length > 0) {
    console.log(`\n👍 Création des likes...`)
    for (const like of likesToCreate) {
      try {
        const likeUsers = await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT "id" FROM "User" WHERE LOWER("email") = ${like.userEmail.toLowerCase()} LIMIT 1
        `
        const likeUser = likeUsers[0]
        if (!likeUser) {
          console.log(`  ⚠️  Utilisateur like non trouvé: ${like.userEmail}`)
          continue
        }

        // Vérifier si le like existe déjà
        const existingLike = await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT "id" FROM "Like" WHERE "postId" = ${like.postId} AND "userId" = ${likeUser.id} LIMIT 1
        `
        if (existingLike.length > 0) {
          console.log(`  ⏭️  Like déjà existant: ${like.userEmail} sur post`)
          continue
        }

        const likeId = `like_bubble_${Date.now()}_${Math.random().toString(36).substring(7)}`
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Like" ("id", "postId", "userId", "createdAt") VALUES ($1, $2, $3, NOW())`,
          likeId,
          like.postId,
          likeUser.id,
        )
        console.log(`  ✅ Like de ${like.userEmail}`)
      } catch (err) {
        console.error(`  ❌ Erreur like:`, err)
      }
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log(`📊 Résumé:`)
  console.log(`  ✅ Commentaires créés:    ${created}`)
  console.log(`  ⚠️  User non trouvé:      ${skippedNoUser}`)
  console.log(`  ⚠️  Post non trouvé:      ${skippedNoPost}`)
  console.log(`  ❌ Erreurs:              ${errors}`)
  console.log("=".repeat(60))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
