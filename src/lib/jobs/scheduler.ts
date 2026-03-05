import cron from "node-cron"
import { runFollowBillingJob } from "./follow-billing.job"
import { runExpirationJob } from "./expiration.job"
import { runWithdrawalProcessingJob } from "./withdrawal-processing.job"

let initialized = false

/**
 * Initialiser les jobs planifiés via node-cron
 * Appelé une seule fois au démarrage du serveur
 */
export function initScheduler() {
  if (initialized) return
  initialized = true

  console.log("[SCHEDULER] Initialisation des jobs planifiés...")

  // Facturation mensuelle des follows — 1er de chaque mois à 03:00 UTC
  cron.schedule("0 3 1 * *", async () => {
    try {
      await runFollowBillingJob()
    } catch (error) {
      console.error("[SCHEDULER] Échec facturation follows:", error)
    }
  }, { timezone: "UTC" })

  // Expiration annuelle — 1er janvier à 00:00 UTC
  cron.schedule("0 0 1 1 *", async () => {
    try {
      await runExpirationJob()
    } catch (error) {
      console.error("[SCHEDULER] Échec expiration annuelle:", error)
    }
  }, { timezone: "UTC" })

  // Traitement des retraits approuvés — tous les jours à 04:00 UTC
  cron.schedule("0 4 * * *", async () => {
    try {
      await runWithdrawalProcessingJob()
    } catch (error) {
      console.error("[SCHEDULER] Échec traitement retraits:", error)
    }
  }, { timezone: "UTC" })

  console.log("[SCHEDULER] Jobs planifiés initialisés:")
  console.log("  - Facturation follows: 1er du mois, 03:00 UTC")
  console.log("  - Expiration annuelle: 1er janvier, 00:00 UTC")
  console.log("  - Traitement retraits: quotidien, 04:00 UTC")
}
