import Stripe from "stripe"

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined
}

function getStripeClient(): Stripe {
  if (globalForStripe.stripe) return globalForStripe.stripe

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY non configurée")
  }

  const client = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  })

  if (process.env.NODE_ENV !== "production") {
    globalForStripe.stripe = client
  }

  return client
}

// Export un proxy qui initialise Stripe à la première utilisation
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    const client = getStripeClient()
    const value = (client as any)[prop]
    if (typeof value === "function") {
      return value.bind(client)
    }
    return value
  },
})
