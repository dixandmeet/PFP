import { NextRequest, NextResponse } from "next/server"
import { FollowBillingService, ExpirationService, WithdrawalService } from "@/lib/services/credits"

/**
 * Endpoint HTTP sécurisé pour déclencher les jobs manuellement
 * POST /api/webhooks/cron?job=follow-billing|expiration|withdrawal-processing
 */
export async function POST(request: NextRequest) {
  // Vérifier le secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const job = request.nextUrl.searchParams.get("job")

  if (!job) {
    return NextResponse.json({ error: "Paramètre 'job' requis" }, { status: 400 })
  }

  try {
    let result

    switch (job) {
      case "follow-billing":
        result = await FollowBillingService.processMonthlyCharges()
        break
      case "expiration":
        result = await ExpirationService.runAnnualExpiration()
        break
      case "withdrawal-processing":
        result = await WithdrawalService.processApprovedWithdrawals()
        break
      default:
        return NextResponse.json({ error: `Job inconnu: ${job}` }, { status: 400 })
    }

    return NextResponse.json({ job, success: true, result })
  } catch (error) {
    console.error(`Erreur job ${job}:`, error)
    return NextResponse.json(
      { job, success: false, error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}
