// POST /api/club/staff-onboarding/kyc — Upload document KYC
// PUT  /api/club/staff-onboarding/kyc — Valider et passer à DONE
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_DOC_TYPES = ["IDENTITY_CARD", "PASSPORT", "DRIVING_LICENSE", "PROOF_OF_ADDRESS"] as const

/**
 * POST — Upload un document KYC pour le staff
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (session.user.role !== "CLUB_STAFF") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const member = await prisma.clubMember.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: { id: true, staffOnboardingStep: true },
    })

    if (!member || member.staffOnboardingStep !== "KYC") {
      return NextResponse.json({ error: "Étape incorrecte" }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const docType = formData.get("docType") as string

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }
    if (!docType || !ALLOWED_DOC_TYPES.includes(docType as any)) {
      return NextResponse.json({ error: "Type de document invalide" }, { status: 400 })
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non accepté. Utilisez PDF, JPG ou PNG." },
        { status: 400 }
      )
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Le fichier ne doit pas dépasser 10 Mo." }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Stockage privé (hors public/ pour éviter l'accès non authentifié)
    const uploadDir = path.join(process.cwd(), "private-uploads", "staff-kyc", session.user.id)
    await mkdir(uploadDir, { recursive: true })
    const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"]
    const rawExt = file.name.split(".").pop()?.toLowerCase() || "pdf"
    const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : "pdf"
    const safeName = `${docType}-${Date.now()}.${ext}`
    const filePath = path.join(uploadDir, safeName)
    await writeFile(filePath, buffer)
    const fileUrl = `/api/uploads/staff-kyc/${session.user.id}/${safeName}`

    // Upsert le document KYC (un seul par type par user)
    const existing = await prisma.kycDocument.findFirst({
      where: { userId: session.user.id, type: docType as any },
    })

    let doc
    if (existing) {
      doc = await prisma.kycDocument.update({
        where: { id: existing.id },
        data: {
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          status: "PENDING",
          reviewedBy: null,
          reviewedAt: null,
          rejectionReason: null,
        },
      })
    } else {
      doc = await prisma.kycDocument.create({
        data: {
          userId: session.user.id,
          type: docType as any,
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          status: "PENDING",
        },
      })
    }

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        createdAt: doc.createdAt,
      },
    })
  } catch (error) {
    console.error("[API] staff-onboarding/kyc POST error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

/**
 * PUT — Valider l'étape KYC et terminer l'onboarding
 */
export async function PUT() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (session.user.role !== "CLUB_STAFF") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const member = await prisma.clubMember.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: { id: true, staffOnboardingStep: true },
    })

    if (!member || member.staffOnboardingStep !== "KYC") {
      return NextResponse.json({ error: "Étape incorrecte" }, { status: 400 })
    }

    // Vérifier qu'au moins un document d'identité a été uploadé
    const identityDocs = await prisma.kycDocument.count({
      where: {
        userId: session.user.id,
        type: { in: ["IDENTITY_CARD", "PASSPORT", "DRIVING_LICENSE"] },
      },
    })

    if (identityDocs === 0) {
      return NextResponse.json(
        { error: "Veuillez uploader au moins une pièce d'identité." },
        { status: 400 }
      )
    }

    // Terminer l'onboarding
    await prisma.clubMember.update({
      where: { id: member.id },
      data: { staffOnboardingStep: "DONE" },
    })

    return NextResponse.json({ success: true, step: "DONE" })
  } catch (error) {
    console.error("[API] staff-onboarding/kyc PUT error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
