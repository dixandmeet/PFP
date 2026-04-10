// Route d'inscription
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { z } from "zod"
import { sendTrackedEmail, emailTemplates } from "@/lib/email"
import { passwordSchema } from "@/lib/validators/schemas"
import { getBaseUrl } from "@/lib/url"
import { notifyAdmins } from "@/lib/notifications/notify-admins"
import { getClientIp } from "@/lib/request-ip"
import {
  peekRateLimit,
  recordRateLimitEvent,
} from "@/lib/rate-limit/api-rate-limit"
import { verifyTurnstileToken } from "@/lib/turnstile"
import { isDisposableEmailDomain } from "@/lib/disposable-email"

const MOBILE_CLIENT_HEADER = "x-pfp-client"
const MOBILE_CLIENT_VALUE = "pfp-mobile"
const MOBILE_SECRET_HEADER = "x-pfp-mobile-secret"

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: passwordSchema,
  role: z.enum(["PLAYER", "AGENT", "CLUB"], {
    errorMap: () => ({ message: "Rôle invalide" }),
  }),
  turnstileToken: z.string().optional(),
})

const REGISTER_MAX_PER_IP_PER_HOUR = 5
const REGISTER_IP_WINDOW_MS = 60 * 60 * 1000
const REGISTER_MAX_PER_EMAIL_PER_10MIN = 1
const REGISTER_EMAIL_WINDOW_MS = 10 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const validatedData = parsed.data
    const emailLower = validatedData.email.toLowerCase()
    const clientIp = getClientIp(request) ?? "unknown"
    const ipKey = clientIp
    const emailKey = emailLower

    if (isDisposableEmailDomain(emailLower)) {
      return NextResponse.json(
        { error: "Les adresses e-mail jetables ou temporaires ne sont pas acceptées." },
        { status: 400 }
      )
    }

    // Mobile client must prove identity with a shared secret (not just a spoofable header)
    const claimsMobile =
      request.headers.get(MOBILE_CLIENT_HEADER)?.toLowerCase() === MOBILE_CLIENT_VALUE
    const mobileSecretValid =
      !!process.env.MOBILE_API_SECRET &&
      request.headers.get(MOBILE_SECRET_HEADER) === process.env.MOBILE_API_SECRET
    const isMobileClient = claimsMobile && mobileSecretValid
    const turnstileSecretConfigured = !!process.env.TURNSTILE_SECRET_KEY

    if (turnstileSecretConfigured && !isMobileClient) {
      const token = validatedData.turnstileToken?.trim()
      if (!token) {
        return NextResponse.json(
          { error: "Vérification anti-robot requise. Actualisez la page et réessayez." },
          { status: 400 }
        )
      }
      const turnstile = await verifyTurnstileToken(token, clientIp === "unknown" ? null : clientIp)
      if (!turnstile.success) {
        return NextResponse.json({ error: "Vérification anti-robot invalide. Réessayez." }, { status: 400 })
      }
    }

    const ipLimit = await peekRateLimit(
      "register_ip",
      ipKey,
      REGISTER_MAX_PER_IP_PER_HOUR,
      REGISTER_IP_WINDOW_MS
    )
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          error: "Trop de tentatives d’inscription depuis cette connexion. Réessayez plus tard.",
          retryAfter: ipLimit.retryAfterSec,
        },
        { status: 429 }
      )
    }

    const emailLimit = await peekRateLimit(
      "register_email",
      emailKey,
      REGISTER_MAX_PER_EMAIL_PER_10MIN,
      REGISTER_EMAIL_WINDOW_MS
    )
    if (!emailLimit.allowed) {
      return NextResponse.json(
        {
          error: "Une inscription avec cet e-mail vient d’être tentée. Patientez quelques minutes.",
          retryAfter: emailLimit.retryAfterSec,
        },
        { status: 429 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    })

    if (existingUser) {
      await recordRateLimitEvent("register_ip", ipKey)
      await recordRateLimitEvent("register_email", emailKey)
      return NextResponse.json({
        message: "Si cet e-mail est disponible, un message de confirmation vous a été envoyé.",
      }, { status: 201 })
    }

    await recordRateLimitEvent("register_ip", ipKey)
    await recordRateLimitEvent("register_email", emailKey)

    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    const user = await prisma.user.create({
      data: {
        email: emailLower,
        password: hashedPassword,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: {
        identifier: emailLower,
        token: verificationToken,
        expires: tokenExpires,
      },
    })

    const baseUrl = getBaseUrl()
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(emailLower)}`

    const userName = validatedData.email.split("@")[0]
    const { subject, html } = emailTemplates.welcomeEmail(userName, verificationUrl)
    sendTrackedEmail({
      to: validatedData.email,
      subject,
      html,
      userId: user.id,
      template: "welcome",
    }).catch(console.error)

    notifyAdmins({
      type: "ADMIN_NEW_USER",
      title: "Nouvel utilisateur",
      message: `${user.email} s'est inscrit en tant que ${user.role}`,
      link: `/admin/users/${user.id}`,
    }).catch(console.error)

    return NextResponse.json(
      {
        message: "Compte créé. Vérifiez votre e-mail pour activer votre compte avant de vous connecter.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
