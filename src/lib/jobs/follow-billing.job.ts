import { FollowBillingService } from "@/lib/services/credits"

export async function runFollowBillingJob() {
  console.log("[CRON] Démarrage facturation mensuelle des follows...")

  try {
    const result = await FollowBillingService.processMonthlyCharges()
    console.log(`[CRON] Facturation terminée:`, result)
    return result
  } catch (error) {
    console.error("[CRON] Erreur facturation follows:", error)
    throw error
  }
}
