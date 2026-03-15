// API route for forgot password
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, emailTemplates } from "@/lib/email"
import crypto from "crypto"
import { getBaseUrl } from "@/lib/url"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: "L'adresse email est requise" },
        { status: 400 }
      )
    }

    // Vérifier le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // On retourne toujours un succès pour des raisons de sécurité
    // (ne pas révéler si un email existe ou non)
    if (!user) {
      // Silently ignore non-existent emails for security
      return NextResponse.json({
        success: true,
        message: "Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation."
      })
    }

    // Supprimer les anciens tokens non utilisés pour cet email
    await prisma.passwordResetToken.deleteMany({
      where: {
        email: email.toLowerCase(),
        used: false
      }
    })

    // Générer un token unique
    const token = crypto.randomBytes(32).toString("hex")
    
    // Créer le token avec expiration dans 1 heure
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    await prisma.passwordResetToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expiresAt
      }
    })

    // Construire le lien de réinitialisation
    const baseUrl = getBaseUrl()
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // Générer le template d'email
    const emailContent = emailTemplates.passwordReset(resetUrl)

    // Envoyer l'email
    const emailResult = await sendEmail({
      to: email.toLowerCase(),
      subject: emailContent.subject,
      html: emailContent.html
    })

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error)
      // On retourne quand même un succès pour ne pas révéler l'erreur
    }

    return NextResponse.json({
      success: true,
      message: "Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation."
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    )
  }
}
