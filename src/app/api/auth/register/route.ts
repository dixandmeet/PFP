// Route d'inscription
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { z } from "zod"
import { sendEmail, emailTemplates } from "@/lib/email"
import { passwordSchema } from "@/lib/validators/schemas"
import { getBaseUrl } from "@/lib/url"

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: passwordSchema,
  role: z.enum(["PLAYER", "AGENT", "CLUB"], {
    errorMap: () => ({ message: "Rôle invalide" })
  }),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: validatedData.email.toLowerCase(),
        password: hashedPassword,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        role: true,
      }
    })

    // Générer un token de vérification d'email
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    await prisma.verificationToken.create({
      data: {
        identifier: validatedData.email.toLowerCase(),
        token: verificationToken,
        expires: tokenExpires,
      }
    })

    // Construire l'URL de vérification
    const baseUrl = getBaseUrl()
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(validatedData.email.toLowerCase())}`

    // Envoyer email de bienvenue avec lien de vérification
    const userName = validatedData.email.split("@")[0]
    const { subject, html } = emailTemplates.welcomeEmail(userName, verificationUrl)
    sendEmail({ to: validatedData.email, subject, html }).catch(console.error)

    return NextResponse.json({
      message: "Compte créé avec succès",
      user,
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Erreur lors de l'inscription:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
