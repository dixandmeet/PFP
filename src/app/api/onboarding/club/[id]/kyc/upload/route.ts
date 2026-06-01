// POST /api/onboarding/club/[id]/kyc/upload — Upload direct (évite CORS avec S3)
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_DOC_TYPES = ["PROOF_LEGAL", "REPRESENTATIVE_ID", "POWER_PROOF", "BANK_RIB"] as const

// Priorité : Vercel Blob (prod) > S3/MinIO > disque local (dev sans S3)
const USE_VERCEL_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN
const USE_LOCAL_STORAGE =
  !USE_VERCEL_BLOB && (process.env.USE_LOCAL_STORAGE === "true" || !process.env.S3_ENDPOINT)
const USE_S3 = !USE_VERCEL_BLOB && !USE_LOCAL_STORAGE

const s3Client = USE_S3
  ? new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: true,
    })
  : null

const BUCKET = process.env.S3_BUCKET || "profoot-files"

type RouteContext = { params: Promise<{ id: string }> }

function generateFileKey(clubId: string, docType: string, filename: string): string {
  const timestamp = Date.now()
  const clean = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
  return `clubs/${clubId}/kyc/${docType}-${timestamp}-${clean}`
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id: clubId } = await context.params

    const club = await prisma.clubProfile.findUnique({
      where: { id: clubId },
      select: { id: true, userId: true, status: true },
    })

    if (!club) {
      return NextResponse.json({ error: "Club introuvable" }, { status: 404 })
    }
    if (club.userId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    if (!["DRAFT", "REJECTED"].includes(club.status)) {
      return NextResponse.json(
        { error: "Les documents ne peuvent pas être modifiés dans l'état actuel du club" },
        { status: 400 }
      )
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

    const key = generateFileKey(clubId, docType, file.name)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"]
    const rawExt = file.name.split(".").pop()?.toLowerCase() || "pdf"
    const safeExt = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : "pdf"
    const safeName = `${docType}-${Date.now()}.${safeExt}`

    // URL logique servie au frontend — toujours auth-guardée via /api/uploads/...
    const logicalUrl = `/api/uploads/clubs/${clubId}/${safeName}`
    let storageKey: string | null = null

    if (USE_VERCEL_BLOB) {
      const { put } = await import("@vercel/blob")
      const blob = await put(`clubs/${clubId}/${safeName}`, buffer, {
        access: "public", // Vercel Blob n'a pas de mode privé natif — la confidentialité passe par /api/uploads
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: true, // URL non devinable même si on connaît le chemin logique
      })
      storageKey = blob.url
    } else if (USE_S3 && s3Client) {
      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type,
          })
        )
        storageKey = `s3://${BUCKET}/${key}`
      } catch (s3Err: unknown) {
        console.error("[KYC upload] S3 error, fallback disque:", s3Err)
        const uploadDir = path.join(process.cwd(), "private-uploads", "clubs", clubId)
        await mkdir(uploadDir, { recursive: true })
        await writeFile(path.join(uploadDir, safeName), buffer)
        storageKey = null
      }
    } else {
      // Disque local (dev sans Blob/S3)
      const uploadDir = path.join(process.cwd(), "private-uploads", "clubs", clubId)
      await mkdir(uploadDir, { recursive: true })
      await writeFile(path.join(uploadDir, safeName), buffer)
      storageKey = null
    }

    const doc = await prisma.clubKycDocument.upsert({
      where: {
        clubId_type: { clubId, type: docType as "PROOF_LEGAL" | "REPRESENTATIVE_ID" | "POWER_PROOF" | "BANK_RIB" },
      },
      update: {
        url: logicalUrl,
        storageKey,
        filename: file.name,
        mime: file.type,
        size: file.size,
        uploadedAt: new Date(),
        verifiedAt: null,
        verifiedByUserId: null,
      },
      create: {
        clubId,
        type: docType as "PROOF_LEGAL" | "REPRESENTATIVE_ID" | "POWER_PROOF" | "BANK_RIB",
        url: logicalUrl,
        storageKey,
        filename: file.name,
        mime: file.type,
        size: file.size,
      },
    })

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        type: doc.type,
        filename: doc.filename,
        size: doc.size,
        uploadedAt: doc.uploadedAt,
      },
    })
  } catch (error) {
    console.error("[API] onboarding/club/[id]/kyc/upload error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
