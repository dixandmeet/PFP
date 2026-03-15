import { PrismaClient, ReportStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function seedReports() {
  console.log("🌱 Seeding rapports de test...")

  try {
    // Trouver un joueur existant
    const player = await prisma.playerProfile.findFirst({
      include: { user: true },
    })

    if (!player) {
      console.log("❌ Aucun joueur trouvé. Créez d'abord un utilisateur.")
      return
    }

    console.log(`✅ Joueur trouvé : ${player.firstName} ${player.lastName}`)

    // Créer des rapports d'exemple
    const reports = [
      {
        title: "Rapport de Performance - Saison 2025/2026",
        authorType: "PLAYER",
        status: ReportStatus.APPROVED,
        sections: [
          {
            title: "Performance Technique",
            content: `Au cours de cette saison, les performances techniques ont montré une progression constante. 
            
Points forts :
- Contrôle de balle excellent (9/10)
- Passes courtes précises (87% de réussite)
- Vision du jeu en constante amélioration

Points à améliorer :
- Tirs de longue distance (55% de précision)
- Jeu aérien défensif`,
            order: 0,
          },
          {
            title: "Condition Physique",
            content: `État physique optimal maintenu tout au long de la saison.

Statistiques :
- Distance parcourue moyenne : 11.2 km par match
- Sprints : 45 par match en moyenne
- Endurance : Excellent (95% du temps de jeu)
- Blessures : Aucune

Programme de renforcement musculaire suivi avec assiduité.`,
            order: 1,
          },
          {
            title: "Aspects Mentaux",
            content: `Évolution positive sur le plan mental et leadership.

Observations :
- Concentration maintenue sur 90 minutes
- Leadership sur le terrain en progression
- Gestion du stress : Très bonne
- Communication avec coéquipiers : Excellente

Points de vigilance :
- Gestion des périodes difficiles à améliorer`,
            order: 2,
          },
          {
            title: "Recommandations",
            content: `Perspectives pour la saison prochaine :

1. Continuer le travail technique (tirs de loin)
2. Développer le jeu aérien
3. Renforcer le leadership
4. Maintenir la condition physique
5. Travailler la polyvalence (positions multiples)

Objectif : Atteindre le niveau professionnel supérieur`,
            order: 3,
          },
        ],
      },
      {
        title: "Évaluation Technique - Novembre 2025",
        authorType: "COACH",
        status: ReportStatus.APPROVED,
        sections: [
          {
            title: "Analyse Technique",
            content: `Évaluation détaillée des compétences techniques.

Dribble : 8/10
- Très bon dans les espaces réduits
- Efficace en 1 contre 1

Passes : 9/10
- Excellente vision du jeu
- Passes longues précises

Tirs : 7/10
- Finition correcte
- À améliorer hors de la surface`,
            order: 0,
          },
          {
            title: "Plan d'Entraînement",
            content: `Programme personnalisé pour les 3 prochains mois :

Semaines 1-4 : Focus technique
- Exercices de précision
- Travail des deux pieds

Semaines 5-8 : Tactique
- Positionnement
- Lecture du jeu

Semaines 9-12 : Intégration
- Matchs simulés
- Évaluation continue`,
            order: 1,
          },
        ],
      },
      {
        title: "Rapport Scout - Potentiel Professionnel",
        authorType: "SCOUT",
        status: ReportStatus.PENDING_APPROVAL,
        sections: [
          {
            title: "Évaluation Générale",
            content: `Joueur prometteur avec un fort potentiel.

Niveau actuel : Semi-professionnel
Potentiel : Professionnel (Ligue 2 / Ligue 1)

Forces principales :
- Intelligence de jeu exceptionnelle
- Polyvalence (3 positions)
- Mentalité de gagnant
- Technique solide

Axes de développement :
- Expérience en compétition de haut niveau
- Aspects physiques (vitesse)`,
            order: 0,
          },
          {
            title: "Recommandations Clubs",
            content: `Clubs recommandés pour la progression :

Ligue 2 (priorité) :
- Clubs formateurs avec temps de jeu garanti
- Encadrement de qualité
- Projet sportif cohérent

International :
- Belgique (Pro League)
- Suisse (Challenge League)
- Portugal (Liga 2)

Estimation de valeur marchande : 150-200k€`,
            order: 1,
          },
        ],
      },
      {
        title: "Bilan Mensuel - Janvier 2026",
        authorType: "PLAYER",
        status: ReportStatus.DRAFT,
        sections: [
          {
            title: "Performances du Mois",
            content: `Résumé des matchs de janvier :

Match 1 vs Équipe A : 7/10
- 1 passe décisive
- Bon match global

Match 2 vs Équipe B : 8/10
- 2 buts
- Homme du match

Match 3 vs Équipe C : 6/10
- Match difficile
- Leçons à tirer

Match 4 vs Équipe D : 9/10
- 1 but, 2 passes décisives
- Performance exceptionnelle`,
            order: 0,
          },
        ],
      },
      {
        title: "Analyse Vidéo - Match du 15 Janvier",
        authorType: "COACH",
        status: ReportStatus.REJECTED,
        sections: [
          {
            title: "Points Positifs",
            content: `Actions remarquables durant le match :

- Excellente course à la 23e minute
- Passe décisive sublime à la 67e
- Défense active toute la partie

Statistiques :
- 89% de passes réussies
- 7 duels gagnés sur 9
- 3 interceptions`,
            order: 0,
          },
          {
            title: "Points à Améliorer",
            content: `Aspects nécessitant du travail :

Positionnement :
- Trop en retrait en première mi-temps
- Meilleur timing des appels

Décisions :
- Quelques choix hâtifs en fin de match
- Conserver le ballon dans les moments clés`,
            order: 1,
          },
        ],
      },
    ]

    // Créer les rapports
    for (const reportData of reports) {
      const { sections, ...reportInfo } = reportData

      const report = await prisma.playerReport.create({
        data: {
          ...reportInfo,
          subjectId: player.id,
          authorId: player.id,
          sections: {
            create: sections,
          },
        },
        include: {
          sections: true,
        },
      })

      console.log(`✅ Créé : ${report.title} (${report.status})`)
      console.log(`   - ${report.sections.length} sections`)
    }

    console.log("\n🎉 Seeding des rapports terminé avec succès !")
    console.log(`📊 ${reports.length} rapports créés`)
  } catch (error) {
    console.error("❌ Erreur lors du seeding :", error)
    throw error
  }
}

seedReports()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
