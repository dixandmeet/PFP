// API: Club Staff Profile — GET (lire) + PUT (mettre a jour)
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { isClubRole } from "@/lib/utils/role-helpers"

const staffProfileUpdateSchema = z.object({
  firstName: z.string().max(100).optional().transform((v) => v?.trim()),
  lastName: z.string().max(100).optional().transform((v) => v?.trim()),
  jobTitle: z.string().max(200).optional().transform((v) => v?.trim()),
  bio: z.string().max(2000).optional().transform((v) => v?.trim()),
  phone: z.string().max(30).optional().transform((v) => v?.trim()),
  profilePicture: z
    .string()
    .optional()
    .nullable()
    .refine((v) => !v || v === "" || v.startsWith("http") || v.startsWith("/"), {
      message: "URL ou chemin invalide",
    }),
  experience: z
    .array(
      z.object({
        club: z.string().max(200),
        role: z.string().max(200),
        startDate: z.string(),
        endDate: z.string().optional().nullable(),
        description: z.string().max(1000).optional(),
      })
    )
    .optional()
    .nullable(),
  skills: z.array(z.string().max(50)).max(30).optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (!isClubRole(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Chercher ou créer le profil staff
    let staffProfile = await prisma.clubStaffProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!staffProfile) {
      // Créer un profil vide automatiquement
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true },
      })

      // Tenter de séparer le name en firstName/lastName
      const nameParts = user?.name?.split(" ") || []
      const firstName = nameParts[0] || null
      const lastName = nameParts.slice(1).join(" ") || null

      staffProfile = await prisma.clubStaffProfile.create({
        data: {
          userId: session.user.id,
          firstName,
          lastName,
        },
      })
    }

    return NextResponse.json(staffProfile)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue"
    const isDev = process.env.NODE_ENV === "development"
    console.error("[API] club/staff/profile GET error:", error)
    return NextResponse.json(
      { error: isDev ? message : "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (!isClubRole(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = staffProfileUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Prisma nécessite Prisma.JsonNull pour les champs Json? quand on veut stocker null
    const experienceValue =
      data.experience === null
        ? Prisma.JsonNull
        : data.experience !== undefined
          ? (data.experience as Prisma.InputJsonValue)
          : undefined

    const updatePayload = {
      ...(data.firstName !== undefined && { firstName: data.firstName || null }),
      ...(data.lastName !== undefined && { lastName: data.lastName || null }),
      ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle || null }),
      ...(data.bio !== undefined && { bio: data.bio || null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.profilePicture !== undefined && {
        profilePicture: data.profilePicture === "" ? null : data.profilePicture,
      }),
      ...(experienceValue !== undefined && { experience: experienceValue }),
      ...(data.skills !== undefined && { skills: Array.isArray(data.skills) ? data.skills : [] }),
    }

    const createPayload = {
      userId: session.user.id,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      jobTitle: data.jobTitle ?? null,
      bio: data.bio ?? null,
      phone: data.phone ?? null,
      profilePicture: data.profilePicture === "" || data.profilePicture == null ? null : data.profilePicture,
      ...(experienceValue !== undefined && { experience: experienceValue }),
      skills: Array.isArray(data.skills) ? data.skills : [],
    }

    const staffProfile = await prisma.clubStaffProfile.upsert({
      where: { userId: session.user.id },
      update: updatePayload,
      create: createPayload,
    })

    return NextResponse.json(staffProfile)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue"
    const isDev = process.env.NODE_ENV === "development"
    console.error("[API] club/staff/profile PUT error:", error)
    return NextResponse.json(
      { error: isDev ? message : "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
