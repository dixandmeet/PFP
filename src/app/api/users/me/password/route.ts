// API: Change current user password
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { passwordSchema as passwordValidator } from "@/lib/validators/schemas"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: passwordValidator,
})

export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = passwordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })

    if (!user?.password) {
      return NextResponse.json(
        { error: "Ce compte utilise une connexion OAuth. Le changement de mot de passe n'est pas disponible." },
        { status: 400 }
      )
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ message: "Mot de passe mis à jour" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
