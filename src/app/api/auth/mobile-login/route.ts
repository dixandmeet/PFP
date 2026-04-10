// Connexion mobile : retourne le token de session en JSON (pas de cookie)
// pour que l’app puisse le stocker et l’envoyer en header Cookie.
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "@/lib/auth"
import { encode } from "next-auth/jwt"
import { z } from "zod"
import { getClientIp } from "@/lib/request-ip"
import {
  peekRateLimit,
  recordRateLimitEvent,
} from "@/lib/rate-limit/api-rate-limit"

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const LOGIN_MAX_PER_IP = 10
const LOGIN_IP_WINDOW_MS = 15 * 60 * 1000 // 15 min
const LOGIN_MAX_PER_EMAIL = 5
const LOGIN_EMAIL_WINDOW_MS = 15 * 60 * 1000 // 15 min

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = bodySchema.parse(body)

    const clientIp = getClientIp(request) ?? "unknown"
    const emailLower = email.toLowerCase()

    // Rate limit par IP
    const ipLimit = await peekRateLimit("login_ip", clientIp, LOGIN_MAX_PER_IP, LOGIN_IP_WINDOW_MS)
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives de connexion. Réessayez plus tard.", retryAfter: ipLimit.retryAfterSec },
        { status: 429 }
      )
    }

    // Rate limit par email
    const emailLimit = await peekRateLimit("login_email", emailLower, LOGIN_MAX_PER_EMAIL, LOGIN_EMAIL_WINDOW_MS)
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives de connexion pour ce compte. Réessayez plus tard.", retryAfter: emailLimit.retryAfterSec },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    })

    if (!user || !user.password) {
      await recordRateLimitEvent("login_ip", clientIp)
      await recordRateLimitEvent("login_email", emailLower)
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      await recordRateLimitEvent("login_ip", clientIp)
      await recordRateLimitEvent("login_email", emailLower)
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error:
            "Vérifiez votre adresse e-mail avant de vous connecter. Un lien vous a été envoyé à l’inscription.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 401 }
      )
    }

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: "Configuration serveur manquante" },
        { status: 500 }
      )
    }

    const defaultToken = {
      name: user.name,
      email: user.email,
      picture: user.image,
      sub: user.id,
      id: user.id,
      role: user.role,
    }
    const account = {
      providerAccountId: user.id,
      type: "credentials" as const,
      provider: "credentials" as const,
    }
    const tokenPayload = await authConfig.callbacks!.jwt!({
      token: defaultToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        image: user.image,
      },
      account,
      trigger: "signIn",
    })

    const sessionMaxAge = authConfig.session?.maxAge ?? 14 * 24 * 60 * 60
    // Auth.js v5 utilise "authjs.session-token" comme salt (nom du cookie)
    const useSecure = process.env.NEXTAUTH_URL?.startsWith("https://") ||
      process.env.AUTH_URL?.startsWith("https://")
    const salt = useSecure
      ? "__Secure-authjs.session-token"
      : "authjs.session-token"
    const sessionToken = await encode({
      token: tokenPayload,
      secret,
      salt,
      maxAge: sessionMaxAge,
    })

    return NextResponse.json({ token: sessionToken })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      )
    }
    console.error("[mobile-login]", e)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
