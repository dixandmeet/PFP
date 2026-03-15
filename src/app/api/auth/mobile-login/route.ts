// Connexion mobile : retourne le token de session en JSON (pas de cookie)
// pour que l’app puisse le stocker et l’envoyer en header Cookie.
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "@/lib/auth"
import { encode } from "next-auth/jwt"
import { z } from "zod"

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = bodySchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
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
