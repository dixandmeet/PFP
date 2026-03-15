import { WithdrawalService } from "@/lib/services/credits"

export async function runWithdrawalProcessingJob() {
  console.log("[CRON] Démarrage traitement des retraits...")

  try {
    const result = await WithdrawalService.processApprovedWithdrawals()
    console.log(`[CRON] Traitement retraits terminé:`, result)
    return result
  } catch (error) {
    console.error("[CRON] Erreur traitement retraits:", error)
    throw error
  }
}
