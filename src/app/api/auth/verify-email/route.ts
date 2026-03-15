// Route de vérification d'email
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import crypto from "crypto"
import { sendTrackedEmail, emailTemplates } from "@/lib/email"
import { getBaseUrl } from "@/lib/url"

// POST - Envoyer un email de vérification
const sendVerificationSchema = z.object({
  email: z.string().email("Email invalide"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = sendVerificationSchema.parse(body)

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, emailVerified: true, name: true }
    })

    // Return same response whether user exists or not to prevent email enumeration
    if (!user || user.emailVerified) {
      return NextResponse.json(
        { message: "Si cette adresse est enregistrée, un email de vérification a été envoyé." },
        { status: 200 }
      )
    }

    // Supprimer les anciens tokens de vérification pour cet email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() }
    })

    // Générer un nouveau token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    // Sauvegarder le token
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      }
    })

    // Envoyer l'email de vérification
    const baseUrl = getBaseUrl()
    const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email.toLowerCase())}`
    const userName = user.name || email.split("@")[0]

    const { subject, html } = emailTemplates.verificationEmail(userName, verificationUrl)
    await sendTrackedEmail({ to: email, subject, html, userId: user.id, template: "verification" })

    return NextResponse.json({
      message: "Email de vérification envoyé",
    }, { status: 200 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Erreur lors de l'envoi de l'email de vérification:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// GET - Vérifier le token d'email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (!token || !email) {
      return NextResponse.json(
        { error: "Token et email requis" },
        { status: 400 }
      )
    }

    // Chercher le token de vérification
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email.toLowerCase(),
        token,
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 400 }
      )
    }

    // Vérifier l'expiration
    if (verificationToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          }
        }
      })

      return NextResponse.json(
        { error: "Token expiré. Veuillez demander un nouveau lien de vérification." },
        { status: 400 }
      )
    }

    // Marquer l'email comme vérifié
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: new Date() }
    })

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        }
      }
    })

    return NextResponse.json({
      message: "Email vérifié avec succès",
      verified: true,
    }, { status: 200 })

  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
