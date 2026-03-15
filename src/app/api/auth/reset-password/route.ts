// API route for reset password
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { passwordSchema } from "@/lib/validators/schemas"

// GET - Vérifier la validité du token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ valid: false })
    }

    // Vérifier le token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    // Vérifier si le token existe, n'est pas utilisé et n'est pas expiré
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ valid: false })
    }

    return NextResponse.json({ valid: true })

  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ valid: false })
  }
}

// POST - Réinitialiser le mot de passe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    // Validation
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token et mot de passe requis" },
        { status: 400 }
      )
    }

    // Valider le mot de passe
    const passwordResult = passwordSchema.safeParse(password)
    if (!passwordResult.success) {
      return NextResponse.json(
        { error: passwordResult.error.errors[0]?.message || "Mot de passe invalide" },
        { status: 400 }
      )
    }

    // Vérifier le token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Lien de réinitialisation invalide" },
        { status: 400 }
      )
    }

    if (resetToken.used) {
      return NextResponse.json(
        { error: "Ce lien a déjà été utilisé" },
        { status: 400 }
      )
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Ce lien a expiré. Veuillez demander un nouveau lien." },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Mettre à jour le mot de passe et marquer le token comme utilisé
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    ])

    // Supprimer tous les autres tokens de réinitialisation pour cet email
    await prisma.passwordResetToken.deleteMany({
      where: {
        email: resetToken.email,
        id: { not: resetToken.id }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès"
    })

  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    )
  }
}
