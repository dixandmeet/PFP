// Connexion mobile via Google : vérifie le token Google et retourne un token de session.
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { encode } from "next-auth/jwt"
import { z } from "zod"

const bodySchema = z.object({
  idToken: z.string().min(1),
})

async function verifyGoogleToken(idToken: string) {
  // Vérifier le token auprès de Google
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  )
  if (!res.ok) {
    throw new Error("Token Google invalide")
  }
  const payload = await res.json()

  // Vérifier que l'audience correspond à notre client ID
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (clientId && payload.aud !== clientId) {
    throw new Error("Token non autorisé pour cette application")
  }

  return {
    email: payload.email as string,
    name: payload.name as string | undefined,
    picture: payload.picture as string | undefined,
    googleId: payload.sub as string,
    emailVerified: payload.email_verified === "true",
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { idToken } = bodySchema.parse(body)

    const googleUser = await verifyGoogleToken(idToken)

    if (!googleUser.email) {
      return NextResponse.json(
        { error: "Email non disponible depuis Google" },
        { status: 400 }
      )
    }

    // Chercher un utilisateur existant par email
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    })

    // Chercher un compte Google lié
    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: "google",
        providerAccountId: googleUser.googleId,
      },
    })

    if (!user && !existingAccount) {
      // Aucun utilisateur trouvé - on ne crée pas de compte automatiquement
      // L'utilisateur doit d'abord s'inscrire
      return NextResponse.json(
        { error: "Aucun compte trouvé avec cet email. Veuillez d'abord créer un compte." },
        { status: 404 }
      )
    }

    if (existingAccount && !user) {
      // Compte Google lié mais utilisateur introuvable (cas rare)
      user = await prisma.user.findUnique({
        where: { id: existingAccount.userId },
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      )
    }

    // Vérifier que le rôle est compatible avec le mobile (PLAYER ou AGENT)
    if (user.role !== "PLAYER" && user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Seuls les joueurs et agents peuvent accéder à l'application mobile" },
        { status: 403 }
      )
    }

    // Lier le compte Google si pas encore lié
    if (!existingAccount) {
      await prisma.account.create({
        data: {
          userId: user.id,
          type: "oauth",
          provider: "google",
          providerAccountId: googleUser.googleId,
        },
      })
    }

    // Mettre à jour l'email vérifié si nécessaire
    if (googleUser.emailVerified && !user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    }

    // Générer le token de session
    const secret = process.env.NEXTAUTH_SECRET
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
      providerAccountId: googleUser.googleId,
      type: "oauth" as const,
      provider: "google" as const,
    }
    const tokenPayload = await authOptions.callbacks!.jwt!({
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

    const sessionMaxAge = authOptions.session?.maxAge ?? 14 * 24 * 60 * 60
    const sessionToken = await encode({
      token: tokenPayload,
      secret,
      maxAge: sessionMaxAge,
    })

    return NextResponse.json({ token: sessionToken })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Token Google requis" },
        { status: 400 }
      )
    }
    console.error("[mobile-google]", e)
    const message = e instanceof Error ? e.message : "Erreur serveur"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
