import Stripe from "stripe"
import { SubscriptionPlan } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { sendEmail, emailTemplates } from "@/lib/email"
import { SubscriptionService } from "./subscription.service"
import { WalletService } from "./wallet.service"
import { PLAN_CONFIG } from "./types"

const PLAN_DISPLAY_NAMES: Record<SubscriptionPlan, string> = {
  FREE: "Gratuit",
  STARTER: "Starter",
  GROWTH: "Growth",
  PRO: "Pro",
  ELITE: "Elite",
}

/** Plans donnant accès à Stripe Connect (retraits) : Growth minimum */
const CONNECT_ELIGIBLE_PLANS: SubscriptionPlan[] = [
  SubscriptionPlan.GROWTH,
  SubscriptionPlan.PRO,
  SubscriptionPlan.ELITE,
]

export class StripeService {
  /** Vérifie si l'utilisateur a un abonnement actif Growth ou supérieur */
  static async isEligibleForConnect(userId: string): Promise<boolean> {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, status: true },
    })
    return (
      sub?.status === "ACTIVE" &&
      sub.plan != null &&
      CONNECT_ELIGIBLE_PLANS.includes(sub.plan)
    )
  }
  /**
   * Créer une session Checkout pour un abonnement
   */
  static async createSubscriptionCheckout(
    userId: string,
    plan: SubscriptionPlan,
    returnUrl: string
  ): Promise<{ sessionUrl: string }> {
    if (plan === SubscriptionPlan.FREE) {
      throw new Error("Le plan Gratuit ne nécessite pas de paiement.")
    }

    const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
    if (!config) {
      throw new Error(`Plan inconnu : ${plan}. Choisissez STARTER, GROWTH, PRO ou ELITE.`)
    }
    if (!config.stripePriceId || config.stripePriceId.trim() === "") {
      throw new Error(
        `Le plan ${plan} n'est pas encore configuré (Stripe). Vérifiez STRIPE_PRICE_${plan} dans .env.`
      )
    }

    // Récupérer ou créer le customer Stripe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (!user) throw new Error("Utilisateur non trouvé")

    const existingSub = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    })

    let customerId = existingSub?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId },
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: config.stripePriceId, quantity: 1 }],
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?cancelled=true`,
      metadata: { userId, plan },
      subscription_data: {
        metadata: { userId, plan },
      },
    })

    if (!session.url) throw new Error("Erreur création session Stripe")

    return { sessionUrl: session.url }
  }

  /**
   * Créer une session Checkout pour un achat de crédits (recharge)
   */
  static async createTopUpCheckout(
    userId: string,
    credits: number,
    returnUrl: string
  ): Promise<{ sessionUrl: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (!user) throw new Error("Utilisateur non trouvé")

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: credits * 100, // 1 crédit = 1€ = 100 centimes
          product_data: {
            name: `${credits} crédits Profoot Profile`,
            description: `Achat de ${credits} crédits (1 crédit = 1€)`,
          },
        },
        quantity: 1,
      }],
      customer_email: user.email,
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?cancelled=true`,
      metadata: {
        userId,
        type: "TOPUP",
        credits: credits.toString(),
      },
    })

    if (!session.url) throw new Error("Erreur création session Stripe")

    return { sessionUrl: session.url }
  }

  /**
   * Créer un compte Stripe Connect Express + lien onboarding
   * Réservé aux utilisateurs avec formule Growth ou supérieure.
   */
  static async createConnectOnboarding(
    userId: string,
    returnUrl: string
  ): Promise<{ onboardingUrl: string }> {
    const eligible = await this.isEligibleForConnect(userId)
    if (!eligible) {
      throw new Error(
        "Pour configurer un compte Stripe Connect, vous devez être au minimum sur la formule Growth."
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })

    if (!user) throw new Error("Utilisateur non trouvé")

    // Vérifier si un compte existe déjà
    let connectAccount = await prisma.stripeConnectAccount.findUnique({
      where: { userId },
    })

    let stripeAccountId: string

    if (connectAccount) {
      stripeAccountId = connectAccount.stripeAccountId
    } else {
      // Créer un compte Express
      const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: { userId },
      })

      stripeAccountId = account.id

      connectAccount = await prisma.stripeConnectAccount.create({
        data: {
          userId,
          stripeAccountId: account.id,
          kycStatus: "PENDING",
        },
      })
    }

    // Créer le lien onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${returnUrl}?refresh=true`,
      return_url: `${returnUrl}?onboarding=complete`,
      type: "account_onboarding",
    })

    return { onboardingUrl: accountLink.url }
  }

  /**
   * Créer un lien vers le dashboard Express (réservé formule Growth+)
   */
  static async createConnectDashboardLink(userId: string): Promise<{ dashboardUrl: string }> {
    const eligible = await this.isEligibleForConnect(userId)
    if (!eligible) {
      throw new Error(
        "L'accès au dashboard Stripe Connect est réservé aux abonnés formule Growth ou supérieure."
      )
    }

    const connectAccount = await prisma.stripeConnectAccount.findUnique({
      where: { userId },
    })

    if (!connectAccount) throw new Error("Aucun compte Connect configuré")

    const loginLink = await stripe.accounts.createLoginLink(
      connectAccount.stripeAccountId
    )

    return { dashboardUrl: loginLink.url }
  }

  /**
   * Obtenir le statut du compte Connect + éligibilité (formule Growth minimum)
   */
  static async getConnectStatus(userId: string) {
    const eligible = await this.isEligibleForConnect(userId)
    const connectAccount = await prisma.stripeConnectAccount.findUnique({
      where: { userId },
    })

    const hasAccount = !!connectAccount
    const isOnboarded = !!(
      connectAccount?.detailsSubmitted &&
      connectAccount?.payoutsEnabled
    )

    if (!connectAccount) {
      return {
        configured: false,
        kycStatus: "NOT_STARTED" as const,
        hasAccount: false,
        isOnboarded: false,
        eligibleForConnect: eligible,
      }
    }

    return {
      configured: true,
      kycStatus: connectAccount.kycStatus,
      chargesEnabled: connectAccount.chargesEnabled,
      payoutsEnabled: connectAccount.payoutsEnabled,
      detailsSubmitted: connectAccount.detailsSubmitted,
      hasAccount: true,
      isOnboarded,
      eligibleForConnect: eligible,
    }
  }

  /**
   * Synchroniser l'abonnement depuis une session Checkout (fallback si le webhook n'a pas été reçu, ex. en local sans Stripe CLI).
   * À appeler côté client après redirection success avec session_id.
   */
  static async syncSubscriptionFromCheckoutSession(
    sessionId: string,
    userId: string
  ): Promise<{ synced: boolean; alreadyActive?: boolean }> {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    })

    if (session.mode !== "subscription" || session.metadata?.userId !== userId) {
      throw new Error("Session invalide ou non associée à cet utilisateur")
    }
    if (session.payment_status !== "paid") {
      throw new Error("Paiement non finalisé")
    }

    const rawSub = session.subscription
    const stripeSubId = typeof rawSub === "string" ? rawSub : (rawSub as Stripe.Subscription)?.id
    if (!stripeSubId) throw new Error("Abonnement Stripe introuvable")

    const existing = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubId, status: "ACTIVE" },
    })
    if (existing) return { synced: false, alreadyActive: true }

    const stripeSubscription =
      typeof rawSub === "object" && rawSub !== null
        ? (rawSub as Stripe.Subscription)
        : await stripe.subscriptions.retrieve(stripeSubId)
    const plan = session.metadata?.plan as SubscriptionPlan
    if (!plan) throw new Error("Plan manquant dans la session")

    await this.activateSubscriptionFromSession(session, stripeSubscription, plan)
    return { synced: true }
  }

  /**
   * Handler pour les événements webhook Stripe
   */
  static async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await this.handleCheckoutComplete(session)
        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        await this.handleInvoicePaid(invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        await this.handlePaymentFailed(invoice)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await this.handleSubscriptionDeleted(subscription)
        break
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account
        await this.handleAccountUpdated(account)
        break
      }

      default:
        break
    }
  }

  private static async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId
    if (!userId) return

    if (session.metadata?.type === "TOPUP") {
      // Achat de crédits
      const credits = parseInt(session.metadata.credits || "0", 10)
      if (credits > 0) {
        await prisma.$transaction(async (tx) => {
          await WalletService.initializeWallets(tx, userId)
          await WalletService.credit(
            tx,
            userId,
            "PURCHASED",
            credits,
            "CREDIT_PURCHASE",
            {
              referenceId: session.id,
              referenceType: "STRIPE_CHECKOUT",
              description: `Achat de ${credits} crédits`,
              idempotencyKey: `topup_${session.id}`,
            }
          )
        })
      }
    } else if (session.mode === "subscription") {
      const plan = session.metadata?.plan as SubscriptionPlan
      const stripeSubscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )
      await this.activateSubscriptionFromSession(session, stripeSubscription, plan)
    }
  }

  private static async activateSubscriptionFromSession(
    session: Stripe.Checkout.Session,
    stripeSubscription: Stripe.Subscription,
    plan: SubscriptionPlan
  ) {
    const userId = session.metadata?.userId
    if (!userId) return

    await SubscriptionService.activateSubscription(
      userId,
      plan,
      session.customer as string,
      stripeSubscription.id,
      new Date(stripeSubscription.current_period_start * 1000),
      new Date(stripeSubscription.current_period_end * 1000)
    )

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })
    const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
    if (user?.email && config) {
      const planName = PLAN_DISPLAY_NAMES[plan] || plan
      const { subject, html } = emailTemplates.subscriptionConfirmed(
        user.name || user.email.split("@")[0],
        planName,
        config.monthlyCredits
      )
      sendEmail({ to: user.email, subject, html }).catch((err) =>
        console.error("[Stripe] Envoi email confirmation abonnement:", err)
      )
    }
  }

  private static async handleInvoicePaid(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return

    // Ne pas traiter la première facture (déjà gérée par checkout.session.completed)
    if (invoice.billing_reason === "subscription_create") return

    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    )

    const userId = subscription.metadata?.userId
    const plan = subscription.metadata?.plan as SubscriptionPlan

    if (!userId || !plan) return

    await SubscriptionService.allocateMonthlyCredits(
      userId,
      plan,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000)
    )
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return

    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    )

    const userId = subscription.metadata?.userId
    if (userId) {
      await SubscriptionService.markPastDue(userId)
    }
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId
    if (userId) {
      await SubscriptionService.cancelSubscription(userId)
    }
  }

  private static async handleAccountUpdated(account: Stripe.Account) {
    const userId = account.metadata?.userId
    if (!userId) return

    const connectAccount = await prisma.stripeConnectAccount.findFirst({
      where: { stripeAccountId: account.id },
    })

    if (!connectAccount) return

    let kycStatus: "NOT_STARTED" | "PENDING" | "VERIFIED" | "REJECTED" = "PENDING"

    if (account.charges_enabled && account.payouts_enabled) {
      kycStatus = "VERIFIED"
    } else if (account.requirements?.disabled_reason) {
      kycStatus = "REJECTED"
    }

    await prisma.stripeConnectAccount.update({
      where: { id: connectAccount.id },
      data: {
        kycStatus,
        chargesEnabled: account.charges_enabled || false,
        payoutsEnabled: account.payouts_enabled || false,
        detailsSubmitted: account.details_submitted || false,
      },
    })
  }
}
