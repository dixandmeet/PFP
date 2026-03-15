// PUT /api/club/staff-onboarding/profile — Sauvegarder le profil staff + avancer vers KYC
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const staffProfileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").max(100).transform((v) => v.trim()),
  lastName: z.string().min(1, "Le nom est requis").max(100).transform((v) => v.trim()),
  jobTitle: z.string().max(200).optional().transform((v) => v?.trim()),
  bio: z.string().max(2000).optional().transform((v) => v?.trim()),
  phone: z.string().max(30).optional().transform((v) => v?.trim()),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (session.user.role !== "CLUB_STAFF") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Vérifier que le membre est à l'étape PROFILE
    const member = await prisma.clubMember.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: { id: true, staffOnboardingStep: true },
    })

    if (!member) {
      return NextResponse.json({ error: "Aucun membership actif" }, { status: 404 })
    }

    if (member.staffOnboardingStep !== "PROFILE") {
      return NextResponse.json(
        { error: "Étape incorrecte" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsed = staffProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Upsert le profil staff
    await prisma.clubStaffProfile.upsert({
      where: { userId: session.user.id },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle || null,
        bio: data.bio || null,
        phone: data.phone || null,
      },
      create: {
        userId: session.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle || null,
        bio: data.bio || null,
        phone: data.phone || null,
      },
    })

    // Avancer vers l'étape KYC
    await prisma.clubMember.update({
      where: { id: member.id },
      data: { staffOnboardingStep: "KYC" },
    })

    return NextResponse.json({ success: true, step: "KYC" })
  } catch (error) {
    console.error("[API] staff-onboarding/profile PUT error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
