import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { generateSlug } from "@/lib/utils/slug"

const acceptSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  agencyName: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseCountry: z.string().optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = acceptSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { token, password, firstName, lastName, agencyName, licenseNumber, licenseCountry, phoneNumber, bio } = parsed.data

    const invitation = await prisma.agentInvitation.findUnique({
      where: { token },
      include: { playerProfile: true },
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 })
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json({ error: "Cette invitation n'est plus valide" }, { status: 410 })
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.agentInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      })
      return NextResponse.json({ error: "Cette invitation a expiré" }, { status: 410 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.agentEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cette adresse email" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const slug = generateSlug(`${firstName} ${lastName}`)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: invitation.agentEmail,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: "AGENT",
          emailVerified: new Date(),
        },
      })

      const agentProfile = await tx.agentProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          slug,
          agencyName: agencyName || null,
          licenseNumber: licenseNumber || null,
          licenseCountry: licenseCountry || null,
          phoneNumber: phoneNumber || null,
          bio: bio || null,
        },
      })

      await tx.agentInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "ACCEPTED",
          acceptedByUserId: user.id,
          acceptedAt: new Date(),
        },
      })

      return { user, agentProfile }
    })

    return NextResponse.json({
      success: true,
      userId: result.user.id,
      email: result.user.email,
    })
  } catch (error: any) {
    console.error("Error accepting agent invitation:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Un conflit est survenu. L'email ou le slug est déjà utilisé." },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    )
  }
}
