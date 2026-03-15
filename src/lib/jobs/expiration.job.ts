import { ExpirationService } from "@/lib/services/credits"

export async function runExpirationJob() {
  console.log("[CRON] Démarrage expiration annuelle des crédits...")

  try {
    const result = await ExpirationService.runAnnualExpiration()
    console.log(`[CRON] Expiration terminée:`, result)
    return result
  } catch (error) {
    console.error("[CRON] Erreur expiration:", error)
    throw error
  }
}
