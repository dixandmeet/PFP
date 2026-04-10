/**
 * Vérifie un jeton Cloudflare Turnstile (https://developers.cloudflare.com/turnstile/).
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp: string | null
): Promise<{ success: boolean; error?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    return { success: false, error: "Turnstile non configuré" }
  }

  const body = new URLSearchParams()
  body.set("secret", secret)
  body.set("response", token)
  if (remoteIp) body.set("remoteip", remoteIp)

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] }

  if (!data.success) {
    const codes = data["error-codes"]?.join(", ") || "unknown"
    return { success: false, error: codes }
  }

  return { success: true }
}
