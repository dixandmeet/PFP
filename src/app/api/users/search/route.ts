// GET /api/users/search?email=... — Recherche d'utilisateur par email
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { searchUserSchema } from "@/lib/validators/club-onboarding-schemas"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Seuls les CLUB et ADMIN peuvent rechercher des utilisateurs
    if (!["CLUB", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const email = request.nextUrl.searchParams.get("email")
    const parsed = searchUserSchema.safeParse({ email })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email invalide", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        role: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json({
        found: false,
        code: "USER_NOT_FOUND",
        canSendOtp: false,
        user: null,
      })
    }

    const canSendOtp = !!user.emailVerified

    return NextResponse.json({
      found: true,
      canSendOtp,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: !!user.emailVerified,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[API] users/search error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
